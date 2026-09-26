import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, Fill, LegalPage, LegalSection } from "@/components/sections/legal-page";
import { legal, providers } from "@/config/legal";
import { featuresOf, PAID_PLANS, PLAN_LIMITS, PLANS } from "@/config/premium";
import { routes, siteConfig } from "@/config/site";
import { formatPlanPrice } from "@/features/premium/format";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales d'utilisation et de vente d'OVO (abonnements Medium et Premium).",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Conditions générales"
      description="Conditions générales d'utilisation (CGU) et de vente (CGV) d'OVO."
    >
      <LegalSection title="1. Objet">
        <p>
          Ces conditions encadrent l&apos;utilisation du site {siteConfig.name} — {siteConfig.meaning}, édité
          par <Fill value={legal.publisherName} label="nom de l'éditeur" /> (voir les{" "}
          <Link href={routes.legalNotice}>mentions légales</Link>), ainsi que la souscription des abonnements
          payants. Utiliser le site ou créer un compte implique de les accepter.
        </p>
      </LegalSection>

      <LegalSection title="2. Le service OVO">
        <p>
          OVO propose, à partir de tes réponses à un questionnaire, une idée de voyage : destination,
          transport, hébergement, activités, restaurants, programme jour par jour et budget estimé.
        </p>
        <ul>
          <li>
            Les prix, durées et disponibilités sont des <strong>estimations indicatives</strong>. Certaines
            données sont des exemples de démonstration, signalés comme tels sur le site.
          </li>
          <li>
            OVO <strong>n&apos;est pas une agence de voyage</strong> : il ne vend ni billet, ni séjour, ni
            réservation. Toute réservation se fait directement auprès des prestataires, à leurs conditions.
          </li>
          <li>
            L&apos;utilisation de base est gratuite et le reste : création de voyages, programme, carte,
            budget, enregistrement, partage et export PDF.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Compte">
        <p>
          Un compte (email et mot de passe) permet d&apos;enregistrer, retrouver, partager et supprimer tes
          voyages. Tu es responsable de la confidentialité de ton mot de passe et des informations que tu
          partages par lien. Tu peux demander la suppression de ton compte à tout moment à <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection title="4. Abonnements OVO Medium et OVO Premium">
        <ul>
          {PAID_PLANS.map((plan) => (
            <li key={plan}>
              <strong>{PLANS[plan].name}</strong> : {formatPlanPrice(PLANS[plan].monthlyPrice)} par mois —{" "}
              {featuresOf(plan)
                .map((f) => f.label.toLowerCase())
                .join(", ")}
              , jusqu&apos;à {PLAN_LIMITS[plan].savedTrips} voyages enregistrés
              {plan === "premium" ? " (et tout OVO Medium)" : ""}.
            </li>
          ))}
        </ul>
        <p>
          Prix en euros. <Fill value={legal.vatMention} label="mention TVA" />. Le prix applicable est celui
          affiché sur la page de paiement au moment de la souscription.
        </p>
        <p>
          <strong>Paiement.</strong> Le paiement se fait par carte sur la page sécurisée de{" "}
          {providers.payments.name} (Stripe). OVO ne voit ni ne conserve tes données bancaires.
          L&apos;abonnement est activé dès que Stripe confirme le paiement.
        </p>
        <p>
          <strong>Durée et renouvellement.</strong> L&apos;abonnement est mensuel, sans engagement, et se
          renouvelle automatiquement chaque mois à la même date jusqu&apos;à sa résiliation.
        </p>
        <p>
          <strong>Changement d&apos;offre et résiliation.</strong> Depuis « Gérer mon abonnement » dans ton
          compte, tu peux à tout moment changer d&apos;offre, mettre à jour ta carte, consulter tes factures
          ou résilier. La résiliation prend effet à la fin de la période déjà payée : tu gardes tes avantages
          jusque-là, puis ton compte repasse à l&apos;offre gratuite, sans perte de tes voyages.
        </p>
        <p>
          <strong>Paiement refusé.</strong> En cas d&apos;échec de paiement, Stripe réessaie automatiquement
          pendant quelques jours et tu en es informé·e dans ton compte. Sans régularisation, l&apos;abonnement
          est suspendu et le compte repasse à l&apos;offre gratuite.
        </p>
      </LegalSection>

      <LegalSection title="5. Droit de rétractation">
        <p>
          Si tu es un consommateur, tu disposes d&apos;un délai de <strong>14 jours</strong> à compter de la
          souscription pour te rétracter, sans avoir à te justifier, en écrivant à <ContactEmail /> (un modèle
          de formulaire est disponible sur demande).
        </p>
        <p>
          En souscrivant, tu demandes que l&apos;abonnement commence immédiatement. Si tu te rétractes après
          avoir commencé à l&apos;utiliser, tu restes redevable d&apos;un montant proportionnel à la période
          déjà utilisée (article L221-25 du Code de la consommation). Le remboursement intervient au plus tard
          14 jours après ta demande, sur le moyen de paiement utilisé.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilité">
        <p>
          OVO fait de son mieux pour proposer des idées pertinentes et un service disponible, sans pouvoir
          garantir l&apos;exactitude des estimations ni une disponibilité permanente du site. OVO ne peut être
          tenu responsable des prestations réservées auprès de tiers (transporteurs, hébergements, activités,
          restaurants).
        </p>
      </LegalSection>

      <LegalSection title="7. Voyages partagés">
        <p>
          Un voyage rendu partageable est visible par toute personne disposant du lien. Tu peux désactiver le
          partage à tout moment ; le lien cesse alors de fonctionner.
        </p>
      </LegalSection>

      <LegalSection title="8. Données personnelles">
        <p>
          Voir la <Link href={routes.privacy}>politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection title="9. Modification des conditions">
        <p>
          Ces conditions peuvent évoluer. En cas de changement important pour les abonnés (notamment de prix),
          tu en seras informé·e avant son application et tu pourras résilier ton abonnement.
        </p>
      </LegalSection>

      <LegalSection title="10. Réclamations, médiation et droit applicable">
        <p>
          Pour toute réclamation, écris d&apos;abord à <ContactEmail />. Si aucune solution n&apos;est
          trouvée, tu peux recourir gratuitement au médiateur de la consommation :{" "}
          {legal.mediator.name.trim() ? (
            legal.mediator.url.trim() ? (
              <a href={legal.mediator.url} target="_blank" rel="noopener noreferrer">
                {legal.mediator.name}
              </a>
            ) : (
              legal.mediator.name
            )
          ) : (
            <Fill value="" label="médiateur de la consommation" />
          )}
          .
        </p>
        <p>Ces conditions sont soumises au droit français.</p>
      </LegalSection>
    </LegalPage>
  );
}
