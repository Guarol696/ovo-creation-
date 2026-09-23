import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { SignInForm } from "@/features/auth/components/auth-forms";
import { FormMessage } from "@/features/auth/components/form-controls";
import { isSaveIntent, param } from "@/features/auth/page-params";
import { getCurrentUser } from "@/features/auth/server/session";
import { authUrl, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const ERRORS: Record<string, string> = {
  lien: "Ce lien a expiré ou a déjà été utilisé. Connecte-toi, ou demande un nouveau lien.",
  indisponible: "Les comptes ne sont pas disponibles pour le moment.",
};

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const params = await searchParams;
  const next = safeNextPath(param(params.next));
  if (await getCurrentUser()) redirect(next);

  const error = ERRORS[param(params.erreur) ?? ""];
  return (
    <AuthShell
      eyebrow="Connexion"
      title="Content de te revoir ✈️"
      description="Connecte-toi pour retrouver tous tes voyages enregistrés."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href={authUrl(routes.signUp, next)} className="font-semibold text-sun-400 hover:underline">
            Crée ton compte gratuitement
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {isSaveIntent(next) && (
          <FormMessage tone="info">
            Connecte-toi pour enregistrer ton voyage : tu y reviendras automatiquement.
          </FormMessage>
        )}
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <SignInForm next={next} />
      </div>
    </AuthShell>
  );
}
