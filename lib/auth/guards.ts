import "server-only";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type Role = "customer" | "verified_buyer" | "staff" | "admin" | "super_admin";

export type AuthContext = { user: User; role: Role };

const STAFF: Role[] = ["staff", "admin", "super_admin"];
const ADMIN: Role[] = ["admin", "super_admin"];

/**
 * Server-side role resolution. Every admin action re-checks the role here — it
 * never trusts middleware alone (Part 6.3). Returns null when unauthorised.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (data?.role as Role) ?? "customer";
  return { user, role };
}

export async function requireStaff(): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  return ctx && STAFF.includes(ctx.role) ? ctx : null;
}

export async function requireAdmin(): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  return ctx && ADMIN.includes(ctx.role) ? ctx : null;
}

export async function requireSuperAdmin(): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  return ctx && ctx.role === "super_admin" ? ctx : null;
}
