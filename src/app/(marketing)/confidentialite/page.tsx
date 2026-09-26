import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, Fill, LegalPage, LegalSection } from "@/components/sections/legal-page";
import { legal, providers } from "@/config/legal";
import { routes } from "@/config/site";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Quelles données OVO collecte, pourquoi, combien de temps, et comment exercer tes droits.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      description="Tes données t'appartiennent : voici ce qu'OVO collecte, pourquoi, et comment garder la main."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement est <Fill value={legal.publisherName} label="nom de l'éditeur" />,
          éditeur du site (voir les <Link href={routes.legalNotice}>mentions légales</Link>). Pour toute
          question sur tes données : <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection title="2. Les données collectées">
        <ul>
          <li>
            <strong>Sans compte</strong> : aucune donnée personnelle. Le questionnaire en cours est gardé
            uniquement dans ton navigateur (stockage local) pour ne rien perdre en cas de rechargement.
          </li>
          <li>
            <strong>Compte</strong> : adresse email, prénom ou pseudo, mot de passe (stocké chiffré, jamais
            lisible par OVO).
          </li>
          <li>
            <strong>Voyages enregistrés</strong> : tes réponses au questionnaire (destination, dates, nombre
            de voyageurs, budget, envies) et le voyage proposé.
          </li>
          <li>
            <strong>Abonnement</strong> : offre choisie, statut et dates de l&apos;abonnement, identifiant
            client Stripe. Tes coordonnées bancaires sont saisies chez Stripe : OVO ne les voit ni ne les
            conserve.
          </li>
          <li>
            <strong>Données techniques</strong> : journaux de connexion de l&apos;hébergeur (adresse IP, date,
            page demandée), conservés pour la sécurité du site.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Pourquoi et sur quelle base">
        <ul>
          <li>
            Fournir le service (compte, voyages enregistrés, partage, abonnement) :{" "}
            <strong>exécution du contrat</strong> (les <Link href={routes.terms}>conditions générales</Link>).
          </li>
          <li>
            Facturation et comptabilité des abonnements : <strong>obligation légale</strong>.
          </li>
          <li>
            Sécurité du site et prévention des abus : <strong>intérêt légitime</strong>.
          </li>
        </ul>
        <p>
          OVO ne vend pas tes données, ne fait pas de publicité ciblée et n&apos;envoie pas de newsletter sans
          ton accord.
        </p>
      </LegalSection>

      <LegalSection title="4. Durée de conservation">
        <ul>
          <li>Compte et voyages enregistrés : tant que ton compte existe, puis suppression.</li>
          <li>Factures et données de paiement : 10 ans (obligation comptable), chez Stripe.</li>
          <li>Journaux techniques : quelques semaines au maximum, selon l&apos;hébergeur.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Qui y a accès">
        <p>Seul l&apos;éditeur d&apos;OVO, et les prestataires techniques suivants, pour leur mission :</p>
        <ul>
          <li>
            <strong>{providers.database.name}</strong> : {providers.database.detail}.
          </li>
          <li>
            <strong>{providers.hosting.name}</strong> : hébergement du site.
          </li>
          <li>
            <strong>{providers.payments.name}</strong> : paiement des abonnements.
          </li>
          <li>
            <strong>{providers.maps.name}</strong> : {providers.maps.detail} (ton navigateur les télécharge
            directement, avec ton adresse IP).
          </li>
        </ul>
        <p>
          Un voyage que tu partages par lien est visible par toute personne qui possède ce lien. Tu peux
          arrêter le partage à tout moment depuis « Mes voyages ».
        </p>
        <p>
          Certains prestataires sont situés aux États-Unis. Ces transferts sont encadrés par le Data Privacy
          Framework UE–États-Unis et/ou les clauses contractuelles types de la Commission européenne.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          OVO n&apos;utilise <strong>aucun cookie publicitaire ni de mesure d&apos;audience</strong>. Seuls
          des cookies indispensables sont déposés : ceux qui te gardent connecté·e à ton compte, et ceux de
          Stripe pendant le paiement (sécurité et lutte contre la fraude). Ils ne nécessitent pas de
          consentement.
        </p>
      </LegalSection>

      <LegalSection title="7. Tes droits">
        <p>
          Tu peux demander l&apos;accès à tes données, leur rectification, leur suppression, leur portabilité,
          la limitation du traitement ou t&apos;y opposer. Écris à <ContactEmail /> : réponse sous un mois. Tu
          peux aussi supprimer toi-même tes voyages enregistrés depuis « Mes voyages ».
        </p>
        <p>
          Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
            cnil.fr
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>
          Les échanges sont chiffrés (HTTPS). Chaque compte n&apos;a accès qu&apos;à ses propres données,
          grâce à des règles de sécurité appliquées directement dans la base. Les mots de passe sont chiffrés.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
