"use server";

import { headers } from "next/headers";
import {
  academySchema,
  contactSchema,
  newsletterSchema,
  productRequestSchema,
  storySchema,
} from "@/lib/validation/schemas";
import { looksLikeSpam, rateLimit } from "@/lib/rate-limit";
import { fail, ok, type ActionResult } from "./result";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}

/**
 * All public form actions follow the same shape: zod parse → spam check → rate
 * limit → persist (best-effort). Persistence uses the RLS insert-only policy on
 * the target table; when Supabase is unconfigured the submission is accepted so
 * the UX can be demonstrated, and logged server-side.
 */
async function guard(
  table: string,
  raw: Record<string, unknown>,
  website: unknown,
  ts: unknown
): Promise<ActionResult | null> {
  if (looksLikeSpam(website as string | undefined, ts as number | undefined)) {
    return fail("spam", "Your submission could not be processed.");
  }
  const ip = await clientIp();
  const { ok: allowed } = await rateLimit(`form:${table}:${ip}`, 5, 60 * 10);
  if (!allowed) return fail("rate_limited", "Too many submissions. Please try again shortly.");
  return null;
}

async function persist(table: string, row: Record<string, unknown>) {
  if (!isSupabaseConfigured) {
    console.info(`[public-form] ${table} (no DB configured):`, row);
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert(row);
  if (error) {
    console.error(`[public-form] ${table} insert failed`, error.message);
    throw new Error("persist failed");
  }
}

export async function subscribeNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the form.", flatten(parsed.error));
  const g = await guard("newsletter_subscribers", parsed.data, parsed.data.website, parsed.data._ts);
  if (g) return g;
  try {
    await persist("newsletter_subscribers", {
      email: parsed.data.email,
      source: parsed.data.source ?? "footer",
      confirmed: false,
    });
    return ok();
  } catch {
    return fail("server", "We couldn't sign you up just now. Please try again.");
  }
}

export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the form.", flatten(parsed.error));
  const g = await guard("contact_submissions", parsed.data, parsed.data.website, parsed.data._ts);
  if (g) return g;
  try {
    await persist("contact_submissions", {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      reason: parsed.data.reason,
      order_number: parsed.data.order_number,
      message: parsed.data.message,
      ip: await clientIp(),
      status: "new",
    });
    return ok();
  } catch {
    return fail("server", "We couldn't send your message. Please try again.");
  }
}

export async function submitProductRequest(input: unknown): Promise<ActionResult> {
  const parsed = productRequestSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the form.", flatten(parsed.error));
  const g = await guard("product_requests", parsed.data, parsed.data.website, parsed.data._ts);
  if (g) return g;
  try {
    await persist("product_requests", {
      name: parsed.data.name,
      email: parsed.data.email,
      product_description: parsed.data.product_description,
      category_hint: parsed.data.category_hint,
      quantity_interest: parsed.data.quantity_interest,
      source_page: parsed.data.source_page,
      status: "new",
    });
    return ok();
  } catch {
    return fail("server", "We couldn't log your request. Please try again.");
  }
}

export async function submitStory(input: unknown): Promise<ActionResult> {
  const parsed = storySchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the form.", flatten(parsed.error));
  const g = await guard("story_submissions", parsed.data, parsed.data.website, parsed.data._ts);
  if (g) return g;
  try {
    await persist("story_submissions", {
      name: parsed.data.name,
      email: parsed.data.email,
      story: parsed.data.story,
      consent: parsed.data.consent,
      status: "new",
    });
    return ok();
  } catch {
    return fail("server", "We couldn't submit your story. Please try again.");
  }
}

export async function applyToAcademy(input: unknown): Promise<ActionResult> {
  const parsed = academySchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the form.", flatten(parsed.error));
  const g = await guard("academy_applications", parsed.data, parsed.data.website, parsed.data._ts);
  if (g) return g;
  try {
    await persist("academy_applications", {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      current_situation: parsed.data.current_situation,
      experience_level: parsed.data.experience_level,
      goals: parsed.data.goals,
      status: "new",
      source: "academy_page",
    });
    return ok();
  } catch {
    return fail("server", "We couldn't submit your application. Please try again.");
  }
}

function flatten(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
