import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell index="KEY" lines={["Reset."]} title="Nouveau mot de passe" intro="Choisis un nouveau mot de passe pour ton compte.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
