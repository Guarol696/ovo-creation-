import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/auth-forms";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  return (
    <AuthShell
      index="IN"
      lines={["Welcome", "back."]}
      title="Connexion"
      intro={params.erreur === "lien" ? "Ce lien a expiré ou a déjà servi. Connecte-toi, ou demande un nouveau lien." : "Reprends exactement là où tu t'es arrêté."}
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href={`${routes.signup}?next=${encodeURIComponent(next)}`} className="text-paper underline underline-offset-4">
            Créer un compte
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
