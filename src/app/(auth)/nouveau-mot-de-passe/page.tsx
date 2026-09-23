import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { NewPasswordForm } from "@/features/auth/components/auth-forms";
import { getCurrentUser } from "@/features/auth/server/session";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

/** Atteinte via le lien « mot de passe oublié » (session ouverte par /auth/confirm) ou depuis le compte. */
export default async function NewPasswordPage() {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthShell
        eyebrow="Nouveau mot de passe"
        title="Ce lien n'est plus valide"
        description="Pour ta sécurité, les liens de réinitialisation expirent rapidement et ne servent qu'une fois."
      >
        <ButtonLink href={routes.forgotPassword} size="lg" className="w-full">
          Demander un nouveau lien
        </ButtonLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Nouveau mot de passe"
      title="Choisis ton nouveau mot de passe"
      description={`Pour le compte ${user.email}.`}
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
