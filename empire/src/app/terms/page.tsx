import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updated="25 octobre 2026">
      <h2>1. Objet</h2>
      <p>Les présentes conditions encadrent l&apos;utilisation de la plateforme {siteConfig.name} : formations, parcours, outils et assistant.</p>
      <h2>2. Compte</h2>
      <p>La création d&apos;un compte est gratuite. Tu es responsable de la confidentialité de ton mot de passe. Les mots de passe sont gérés par notre prestataire d&apos;authentification et ne sont jamais stockés en clair.</p>
      <h2>3. Offres payantes</h2>
      <p>Les offres Pro et Premium sont des abonnements mensuels, sans engagement, résiliables à tout moment depuis le portail de facturation. Le paiement est traité par Stripe ; l&apos;accès est activé à la confirmation du paiement et retiré à la fin de l&apos;abonnement.</p>
      <h2>4. Contenus</h2>
      <p>Les contenus marqués « démo » sont des exemples destinés à présenter la plateforme. Ils ne constituent pas des formations complètes.</p>
      <h2>5. Assistant IA</h2>
      <p>Les réponses de l&apos;assistant sont générées automatiquement et peuvent comporter des erreurs. Elles ne constituent pas un conseil juridique, fiscal ou financier.</p>
      <h2>6. Contact</h2>
      <p>Pour toute question, utilise la page contact.</p>
    </LegalPage>
  );
}
