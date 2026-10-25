import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/auth-forms";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNextPath((await searchParams).next);
  return (
    <AuthShell
      index="START"
      lines={["Start", "your", "journey."]}
      title="Créer un compte"
      intro="Gratuit. Enregistre ta progression, tes notes et tes projets sur tous tes appareils."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href={`${routes.login}?next=${encodeURIComponent(next)}`} className="text-paper underline underline-offset-4">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthShell>
  );
}
