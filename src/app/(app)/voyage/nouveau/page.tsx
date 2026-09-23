import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "Créer mon voyage" };

export default function NewTripPage() {
  return (
    <ComingSoon
      eyebrow="Créer mon voyage"
      title="Le questionnaire arrive très bientôt."
      description="Envies, budget, dates, voyageurs et style : c'est ici que tu diras à OVO ce dont tu as envie."
    />
  );
}
