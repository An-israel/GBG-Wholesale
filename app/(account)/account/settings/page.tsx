import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  let email: string | null = null;
  let marketing = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      email = user.email ?? null;
      const { data } = await supabase.from("profiles").select("marketing_opt_in").eq("id", user.id).single();
      marketing = !!data?.marketing_opt_in;
    }
  }

  if (!email) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-h1 font-display">Sign in to manage settings</h1>
        <ButtonLink href="/login" variant="primary" className="mt-4">Sign in</ButtonLink>
      </Container>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Settings" }]} />
      <Container className="py-10">
        <div className="mx-auto max-w-lg">
          <Eyebrow>Settings</Eyebrow>
          <h1 className="text-h1 font-display">Your profile</h1>
          <dl className="mt-6 divide-y divide-line rounded-[var(--radius-card)] border border-line text-sm">
            <div className="flex justify-between p-4"><dt className="text-ink-50">Email</dt><dd>{email}</dd></div>
            <div className="flex justify-between p-4"><dt className="text-ink-50">Marketing emails</dt><dd>{marketing ? "On" : "Off"}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-ink-50">
            Need to update something or delete your data? <Link href="/contact?reason=other" className="text-navy underline">Contact us</Link> and we&apos;ll action your request.
          </p>
        </div>
      </Container>
    </>
  );
}
