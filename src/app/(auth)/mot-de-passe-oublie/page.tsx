import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { ForgotPasswordForm } from "@/features/auth/components/auth-forms";
import { FormMessage } from "@/features/auth/components/form-controls";
import { param } from "@/features/auth/page-params";
import { authUrl, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/mot-de-passe-oublie">) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const params = await searchParams;
  const next = safeNextPath(param(params.next));
  const expired = param(params.erreur) === "lien";
  return (
    <AuthShell
      eyebrow="Mot de passe oublié"
      title="Pas de panique 🔑"
      description="Indique l'email de ton compte : on t'envoie un lien pour choisir un nouveau mot de passe."
      footer={
        <Link
          href={authUrl(routes.login, next)}
          className="inline-flex min-h-11 items-center font-semibold text-sun-400 hover:underline"
        >
          ← Retour à la connexion
        </Link>
      }
    >
      <div className="space-y-5">
        {expired && (
          <FormMessage tone="error">
            Ce lien a expiré ou a déjà été utilisé. Demande un nouveau lien ci-dessous.
          </FormMessage>
        )}
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
