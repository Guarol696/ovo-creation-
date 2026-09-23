import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <ComingSoon
      eyebrow="Connexion"
      title="Ton espace OVO arrive bientôt."
      description="Tu pourras bientôt créer ton compte pour sauvegarder et partager tes voyages."
    />
  );
}
