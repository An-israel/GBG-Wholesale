"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireStaff } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeHtml } from "@/lib/sanitize";
import { getStripe } from "@/lib/stripe/server";
import { sendEmail } from "@/lib/email/send";
import { orderShippedEmail } from "@/emails/templates";
import { fail, ok, type ActionResult } from "./result";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// --------------------------------------------------------------------------
// Products
// --------------------------------------------------------------------------
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  slug: z.string().optional(),
  sku: z.string().min(3),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "archived"]),
  short_description: z.string().optional(),
  description_html: z.string().optional(),
  what_you_receive: z.string().optional(),
  who_it_suits: z.string().optional(),
  why_buy: z.string().optional(),
  wholesale_price_pence: z.coerce.number().int().min(0),
  compare_at_price_pence: z.coerce.number().int().min(0).nullable().optional(),
  suggested_retail_price_pence: z.coerce.number().int().min(0).nullable().optional(),
  moq: z.coerce.number().int().min(1),
  pack_quantity: z.coerce.number().int().min(1),
  mix_and_match_allowed: z.coerce.boolean().optional(),
  low_stock_threshold: z.coerce.number().int().min(0),
  suitability: z.array(z.string()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export async function upsertProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Please check the product fields.", flatten(parsed.error));

  const supabase = createAdminClient();
  const d = parsed.data;
  const row = {
    name: d.name,
    slug: d.slug || slugify(d.name),
    sku: d.sku,
    category_id: d.category_id ?? null,
    status: d.status,
    short_description: d.short_description ?? null,
    description_html: d.description_html ? sanitizeHtml(d.description_html) : null,
    what_you_receive: d.what_you_receive ?? null,
    who_it_suits: d.who_it_suits ?? null,
    why_buy: d.why_buy ?? null,
    wholesale_price_pence: d.wholesale_price_pence,
    compare_at_price_pence: d.compare_at_price_pence ?? null,
    suggested_retail_price_pence: d.suggested_retail_price_pence ?? null,
    moq: d.moq,
    pack_quantity: d.pack_quantity,
    mix_and_match_allowed: !!d.mix_and_match_allowed,
    low_stock_threshold: d.low_stock_threshold,
    suitability: d.suitability ?? [],
    seo_title: d.seo_title ?? null,
    seo_description: d.seo_description ?? null,
    published_at: d.status === "active" ? new Date().toISOString() : null,
  };

  const { data, error } = d.id
    ? await supabase.from("products").update(row).eq("id", d.id).select("id, slug").single()
    : await supabase.from("products").insert(row).select("id, slug").single();
  if (error || !data) return fail("server", "We couldn't save the product.");

  revalidatePath("/shop");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/admin/products");
  return ok({ id: data.id });
}

const quickEditSchema = z.object({
  id: z.string().uuid(),
  wholesale_price_pence: z.coerce.number().int().min(0).optional(),
  set_stock: z.coerce.number().int().min(0).optional(),
});

/** Inline quick edit of price and stock. Stock changes go through the ledger. */
export async function quickEditProduct(input: unknown): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const parsed = quickEditSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid values.");
  const supabase = createAdminClient();
  const { id, wholesale_price_pence, set_stock } = parsed.data;

  if (wholesale_price_pence !== undefined) {
    await supabase.from("products").update({ wholesale_price_pence }).eq("id", id);
  }
  if (set_stock !== undefined) {
    const { data: prod } = await supabase.from("products").select("stock_quantity").eq("id", id).single();
    const delta = set_stock - (prod?.stock_quantity ?? 0);
    if (delta !== 0) {
      await supabase.from("inventory_movements").insert({ product_id: id, delta, reason: "correction", actor_id: ctx.user.id, note: "admin quick edit" });
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return ok();
}

/** Restock via an explicit ledger movement with a reason (Part 14.5). */
export async function restockProduct(input: unknown): Promise<ActionResult> {
  const ctx = await requireStaff();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ product_id: z.string().uuid(), delta: z.coerce.number().int(), reason: z.enum(["restock", "correction", "damage"]), note: z.string().optional() });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid restock values.");
  const supabase = createAdminClient();
  await supabase.from("inventory_movements").insert({ ...parsed.data, actor_id: ctx.user.id });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return ok();
}

// --------------------------------------------------------------------------
// Orders
// --------------------------------------------------------------------------
const orderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).optional(),
  tracking_number: z.string().optional(),
  tracking_url: z.string().url().optional().or(z.literal("")),
  carrier: z.string().optional(),
  admin_note: z.string().optional(),
});

/** Update status/tracking. Entering tracking triggers the shipped email. */
export async function updateOrder(input: unknown): Promise<ActionResult> {
  const ctx = await requireStaff();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid order values.");
  const supabase = createAdminClient();
  const d = parsed.data;

  const { data: existing } = await supabase.from("orders").select("email, tracking_number, order_number").eq("id", d.id).single();
  const nowShipping = d.tracking_number && d.tracking_number !== existing?.tracking_number;

  const patch: Record<string, unknown> = {};
  if (d.status) patch.status = d.status;
  if (d.tracking_number !== undefined) patch.tracking_number = d.tracking_number;
  if (d.tracking_url) patch.tracking_url = d.tracking_url;
  if (d.carrier !== undefined) patch.carrier = d.carrier;
  if (d.admin_note !== undefined) patch.admin_note = d.admin_note;
  if (nowShipping) {
    patch.status = "shipped";
    patch.fulfilment_status = "fulfilled";
    patch.shipped_at = new Date().toISOString();
  }
  await supabase.from("orders").update(patch).eq("id", d.id);

  if (nowShipping && existing?.email) {
    const tpl = orderShippedEmail({ orderNumber: existing.order_number, trackingNumber: d.tracking_number!, trackingUrl: d.tracking_url || undefined, carrier: d.carrier });
    await sendEmail({ to: existing.email, subject: tpl.subject, template: "order_shipped", html: tpl.html, text: tpl.text });
  }
  revalidatePath(`/admin/orders/${d.id}`);
  revalidatePath("/admin/orders");
  return ok();
}

/** Refund via the Stripe API; optionally restock (Part 14.2). */
export async function refundOrder(input: unknown): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ id: z.string().uuid(), amount_pence: z.coerce.number().int().min(1), restock: z.coerce.boolean().optional() });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid refund values.");
  const supabase = createAdminClient();
  const { data: order } = await supabase.from("orders").select("stripe_payment_intent_id, total_pence, admin_note").eq("id", parsed.data.id).single();
  if (!order) return fail("not_found", "Order not found.");

  const stripe = getStripe();
  if (stripe && order.stripe_payment_intent_id) {
    try {
      const refund = await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id, amount: parsed.data.amount_pence });
      await supabase.from("refunds").insert({ order_id: parsed.data.id, stripe_refund_id: refund.id, amount_pence: parsed.data.amount_pence, actor_id: ctx.user.id, status: refund.status ?? "pending" });
    } catch {
      return fail("stripe", "Stripe refund failed.");
    }
  }

  const fullyRefunded = parsed.data.amount_pence >= order.total_pence;
  // Appending "restock" to admin_note triggers on_order_refunded to reverse stock.
  const note = parsed.data.restock ? `${order.admin_note ?? ""} restock`.trim() : order.admin_note;
  await supabase.from("orders").update({
    status: fullyRefunded ? "refunded" : "partially_refunded",
    payment_status: fullyRefunded ? "refunded" : "partially_refunded",
    admin_note: note,
  }).eq("id", parsed.data.id);

  revalidatePath(`/admin/orders/${parsed.data.id}`);
  return ok();
}

// --------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------
export async function upsertSetting(input: unknown): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ key: z.string(), value: z.string() });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid setting.");
  let value: unknown;
  try {
    value = JSON.parse(parsed.data.value);
  } catch {
    value = parsed.data.value; // store as a JSON string if not valid JSON
  }
  const supabase = createAdminClient();
  await supabase.from("site_settings").update({ value }).eq("key", parsed.data.key);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return ok();
}

// --------------------------------------------------------------------------
// Content (sanitised on save)
// --------------------------------------------------------------------------
export async function upsertPolicyPage(input: unknown): Promise<ActionResult> {
  const ctx = await requireStaff();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ slug: z.string(), title: z.string(), body_html: z.string() });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid page.");
  const supabase = createAdminClient();
  await supabase.from("pages").update({ title: parsed.data.title, body_html: sanitizeHtml(parsed.data.body_html), last_reviewed_at: new Date().toISOString() }).eq("slug", parsed.data.slug);
  revalidatePath(`/${parsed.data.slug}`);
  return ok();
}

// --------------------------------------------------------------------------
// Product requests & Hub membership
// --------------------------------------------------------------------------
export async function setProductRequestStatus(input: unknown): Promise<ActionResult> {
  const ctx = await requireStaff();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ id: z.string().uuid(), status: z.enum(["new", "reviewing", "sourcing", "stocked", "declined"]) });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "Invalid status.");
  const supabase = createAdminClient();
  await supabase.from("product_requests").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath("/admin/product-requests");
  return ok();
}

export async function setHubMembership(input: unknown): Promise<ActionResult> {
  const ctx = await requireAdmin();
  if (!ctx) return fail("forbidden", "You don't have permission to do that.");
  const schema = z.object({ user_id: z.string().uuid(), grant: z.coerce.boolean(), reason: z.string().min(2) });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid", "A reason is required.");
  const supabase = createAdminClient();
  const { user_id, grant, reason } = parsed.data;
  await supabase.from("profiles").update({ is_verified_buyer: grant, verified_at: grant ? new Date().toISOString() : null }).eq("id", user_id);
  if (grant) {
    await supabase.from("community_memberships").upsert({ user_id, type: "wholesale_hub", source: "manual", granted_by: ctx.user.id }, { onConflict: "user_id,type" });
  } else {
    await supabase.from("community_memberships").update({ revoked_at: new Date().toISOString() }).eq("user_id", user_id).eq("type", "wholesale_hub");
  }
  await supabase.from("admin_audit_log").insert({ actor_id: ctx.user.id, actor_email: ctx.user.email, action: grant ? "hub_grant" : "hub_revoke", entity_type: "profiles", entity_id: user_id, after: { reason } });
  revalidatePath("/admin/customers");
  return ok();
}

function flatten(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
