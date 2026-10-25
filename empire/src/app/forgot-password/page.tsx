import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const expired = (await searchParams).erreur === "lien";
  return (
    <AuthShell
      index="KEY"
      lines={["New", "key."]}
      title="Mot de passe oublié"
      intro={expired ? "Ce lien a expiré. Demande-en un nouveau ci-dessous." : "Indique ton email : tu recevras un lien pour choisir un nouveau mot de passe."}
      footer={
        <Link href={routes.login} className="text-paper underline underline-offset-4">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
