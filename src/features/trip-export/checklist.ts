import type { TravelPlan } from "@/types/travel-plan";

/**
 * Checklist de départ du carnet de voyage (Premium), adaptée à la destination,
 * au transport, au style de voyage et aux voyageurs. Conseils généraux :
 * les conditions officielles d'entrée restent à vérifier avant le départ.
 */

export interface ChecklistGroup {
  title: string;
  items: string[];
}

/** Pays de l'Union européenne (carte européenne d'assurance maladie). */
const EU = new Set("FR PT ES IT NL BE DE CZ HU AT DK GR HR IE PL SE FI".split(" "));
/** Pays hors espace Schengen (hors UE) : passeport souvent exigé. */
const PASSPORT_REQUIRED = new Set(["GB", "MA", "TR", "JP", "US", "ID", "TH"]);

const CURRENCIES: Record<string, string> = {
  GB: "livre sterling (GBP)",
  CZ: "couronne tchèque (CZK)",
  HU: "forint (HUF)",
  MA: "dirham (MAD)",
  TR: "livre turque (TRY)",
  DK: "couronne danoise (DKK)",
  JP: "yen (JPY)",
};
const EURO = new Set(["FR", "PT", "ES", "IT", "NL", "BE", "DE", "AT", "GR", "HR", "IE", "FI"]);

export function buildChecklist(plan: TravelPlan): ChecklistGroup[] {
  const code = plan.destination.countryCode?.toUpperCase() ?? "";
  const styles = new Set(plan.travelStyle);
  const documents: string[] = [];
  if (PASSPORT_REQUIRED.has(code)) {
    documents.push("Passeport valide (vérifie la durée de validité exigée et les formalités d'entrée)");
  } else if (EU.has(code)) {
    documents.push("Carte d'identité ou passeport en cours de validité");
    documents.push("Carte européenne d'assurance maladie");
  } else {
    documents.push("Passeport ou carte d'identité : vérifie les formalités d'entrée pour ta destination");
  }
  documents.push("Assurance voyage et numéros d'assistance");
  if (plan.travelers.children > 0) {
    documents.push("Documents des enfants (et autorisation de sortie du territoire si nécessaire)");
  }

  const bookings: string[] = [];
  const mode = plan.transport.main.mode;
  if (mode === "avion") bookings.push("Billets d'avion et enregistrement en ligne 24 à 48 h avant le vol");
  if (mode === "train") bookings.push("Billets de train téléchargés sur ton téléphone");
  if (mode === "bus") bookings.push("Billets de bus et point de départ repéré");
  if (mode === "voiture") bookings.push("Permis de conduire, assurance du véhicule et péages prévus");
  bookings.push(`Réservation de l'hébergement (quartier ${plan.accommodation.main.area})`);
  bookings.push("Activités à réserver à l'avance (musées, visites guidées, excursions)");

  const money: string[] = [];
  if (CURRENCIES[code]) money.push(`Monnaie locale : ${CURRENCIES[code]}, prévoir un peu d'espèces`);
  else if (EURO.has(code)) money.push("Monnaie : euro, pas de change nécessaire");
  else money.push("Monnaie locale et moyens de paiement acceptés à vérifier");
  money.push("Carte bancaire utilisable à l'étranger (et frais éventuels vérifiés)");
  money.push(
    `Budget du séjour en tête : environ ${Math.round(plan.estimatedBudget.perPerson)} € par personne`,
  );

  const bag: string[] = ["Chargeur et batterie externe"];
  if (code === "GB") bag.push("Adaptateur de prise (type G)");
  if (styles.has("plage")) bag.push("Maillot de bain, crème solaire et serviette");
  if (styles.has("nature") || styles.has("aventure")) bag.push("Chaussures de marche et gourde");
  if (styles.has("fete")) bag.push("Pièce d'identité à garder sur toi en soirée");
  bag.push("Médicaments habituels et petite trousse de secours");

  return [
    { title: "Documents", items: documents },
    { title: "Réservations", items: bookings },
    { title: "Argent & paiement", items: money },
    { title: "Dans la valise", items: bag },
  ];
}
