import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AccountShell
      eyebrow="Progmasoft account"
      title="Sign in securely."
      description="Continue to your account dashboard and connected services."
    >
      <AuthForm mode="login" />
    </AccountShell>
  );
}
