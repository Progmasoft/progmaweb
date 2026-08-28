import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AccountShell
      eyebrow="Create an identity"
      title="Start with a durable account."
      description="Choose the name used in your Progmasoft account URL."
    >
      <AuthForm mode="register" />
    </AccountShell>
  );
}
