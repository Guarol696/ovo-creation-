import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <ComingSoon
      eyebrow="Légal"
      title="Conditions d'utilisation"
      description="Les conditions générales d'utilisation d'OVO seront publiées avant l'ouverture des comptes utilisateurs."
    />
  );
}
