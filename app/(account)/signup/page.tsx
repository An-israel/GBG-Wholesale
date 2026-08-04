import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { SignupForm } from "@/components/forms/signup-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md">
        <Eyebrow>Join GBG</Eyebrow>
        <h1 className="text-h1 font-display">Create your account</h1>
        <p className="mt-2 text-ink-70">Track orders, save addresses, and unlock the Hub with your first purchase.</p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
