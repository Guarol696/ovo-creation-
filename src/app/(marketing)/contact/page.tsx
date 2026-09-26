import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, LegalSection } from "@/components/sections/legal-page";
import { routes } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une idée, un souci avec ton abonnement ? Écris à l'équipe OVO.",
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Contact"
      title="On t'écoute."
      description="Une question, une idée, un partenariat ou un souci avec ton abonnement ? Écris-nous."
    >
      <LegalSection title="Par email">
        <p>
          <ContactEmail /> — on répond en général sous 48 h (jours ouvrés).
        </p>
        <p>
          Pour aller plus vite, indique l&apos;email de ton compte OVO et décris ta demande en quelques mots.
        </p>
      </LegalSection>

      <LegalSection title="Abonnement">
        <p>
          Tu peux changer d&apos;offre, résilier ou télécharger tes factures toi-même depuis{" "}
          <Link href={routes.account}>Mon compte</Link> → « Gérer mon abonnement ». Pour exercer ton droit de
          rétractation, écris-nous à l&apos;adresse ci-dessus (voir les{" "}
          <Link href={routes.terms}>conditions générales</Link>).
        </p>
      </LegalSection>

      <LegalSection title="Tes données">
        <p>
          Accès, correction ou suppression de tes données : même adresse. Tout est expliqué dans la{" "}
          <Link href={routes.privacy}>politique de confidentialité</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
