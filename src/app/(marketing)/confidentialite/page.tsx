import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <ComingSoon
      eyebrow="Légal"
      title="Politique de confidentialité"
      description="Tes données t'appartiennent. Notre politique de confidentialité détaillée sera publiée avant l'ouverture des comptes utilisateurs."
    />
  );
}
