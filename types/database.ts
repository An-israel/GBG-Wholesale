/**
 * Generated Supabase types.
 *
 * Once the Supabase project is provisioned and migrations are applied, generate
 * the fully-typed schema into this file:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts
 *
 * Then import `Database` where a typed client is needed, e.g.
 *   createServerClient<Database>(url, key, { cookies })
 *
 * Until then the storefront relies on the hand-written domain types in
 * types/domain.ts, which mirror the columns the public site reads.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Placeholder until `supabase gen types` is run against the live project.
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
