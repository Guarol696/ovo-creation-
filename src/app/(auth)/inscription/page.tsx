import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { SignUpForm } from "@/features/auth/components/auth-forms";
import { FormMessage } from "@/features/auth/components/form-controls";
import { isSaveIntent, param } from "@/features/auth/page-params";
import { getCurrentUser } from "@/features/auth/server/session";
import { authUrl, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const next = safeNextPath(param((await searchParams).next));
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Crée ton compte OVO"
      description="Gratuit, en 30 secondes. Tes voyages enregistrés t'attendent sur tous tes appareils."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href={authUrl(routes.login, next)} className="font-semibold text-sun-400 hover:underline">
            Connecte-toi
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {isSaveIntent(next) && (
          <FormMessage tone="info">
            Une fois ton compte créé, ton voyage sera enregistré automatiquement.
          </FormMessage>
        )}
        <SignUpForm next={next} />
      </div>
    </AuthShell>
  );
}
