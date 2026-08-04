import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md">
        <Eyebrow>Welcome back</Eyebrow>
        <h1 className="text-h1 font-display">Sign in</h1>
        <p className="mt-2 text-ink-70">Access your orders, addresses and the Wholesale Hub.</p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
