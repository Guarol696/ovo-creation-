import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, Fill, LegalPage, LegalSection } from "@/components/sections/legal-page";
import { legal, providers } from "@/config/legal";
import { routes, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et informations légales du site OVO.",
};

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales" description="Qui édite OVO, qui l'héberge, et comment nous joindre.">
      <LegalSection title="Éditeur du site">
        <p>
          Le site {siteConfig.name} — {siteConfig.meaning} ({siteConfig.url.replace(/^https?:\/\//, "")}) est
          édité par :
        </p>
        <ul>
          <li>
            <Fill value={legal.publisherName} label="nom ou raison sociale" />
          </li>
          <li>
            Statut : <Fill value={legal.publisherStatus} label="statut juridique" />
          </li>
          <li>
            SIRET : <Fill value={legal.siret} label="numéro SIRET" />
          </li>
          <li>
            Adresse : <Fill value={legal.address} label="adresse postale" />
          </li>
          <li>
            Email : <ContactEmail />
          </li>
        </ul>
        <p>
          Directeur·rice de la publication :{" "}
          <Fill value={legal.publicationDirector} label="directeur·rice de la publication" />.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par <strong>{providers.hosting.name}</strong>, {providers.hosting.address} (
          <a href={providers.hosting.url} target="_blank" rel="noopener noreferrer">
            vercel.com
          </a>
          ).
        </p>
        <p>
          Les comptes et les voyages enregistrés sont conservés par <strong>{providers.database.name}</strong>{" "}
          ({providers.database.detail}). Les paiements sont traités par{" "}
          <strong>{providers.payments.name}</strong>, {providers.payments.address}.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          La marque {siteConfig.name}, le logo, les textes, le design et le code du site sont la propriété de
          l&apos;éditeur. Toute reproduction sans autorisation est interdite. Les photographies proviennent
          d&apos;Unsplash (licence Unsplash) et les fonds de carte de CARTO et des contributeurs
          d&apos;OpenStreetMap.
        </p>
      </LegalSection>

      <LegalSection title="Informations de voyage">
        <p>
          Les propositions d&apos;OVO (destinations, transports, hébergements, activités, restaurants et
          budgets) sont des <strong>estimations indicatives</strong>. Certaines données sont des exemples de
          démonstration, signalés comme tels. OVO n&apos;est pas une agence de voyage et ne vend ni billet ni
          réservation : vérifie toujours les prix et disponibilités auprès des prestataires.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement de tes données est décrit dans la{" "}
          <Link href={routes.privacy}>politique de confidentialité</Link>. Les conditions d&apos;utilisation
          et de vente sont dans les <Link href={routes.terms}>conditions générales</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
