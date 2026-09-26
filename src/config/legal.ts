/**
 * Informations légales d'OVO (mentions légales, CGU/CGV, confidentialité, contact).
 *
 * À compléter par l'éditeur du site : tant qu'un champ est vide, les pages
 * légales affichent « à compléter » à sa place. Ne jamais inventer ces valeurs.
 */
export const legal = {
  /** Nom de l'éditeur : prénom et nom (entrepreneur individuel) ou raison sociale. */
  publisherName: "",
  /** Statut, ex. « Entrepreneur individuel (micro-entreprise) » ou « SAS au capital de 1 000 € ». */
  publisherStatus: "",
  /** Numéro SIRET (ou RCS + ville pour une société). */
  siret: "",
  /** Adresse postale (domiciliation acceptée). */
  address: "",
  /** Email de contact affiché sur le site (support, données personnelles, rétractation). */
  email: "",
  /** Directeur·rice de la publication (en général l'éditeur). */
  publicationDirector: "",
  /**
   * Mention de TVA sur les prix. Micro-entreprise en franchise de TVA :
   * « TVA non applicable, article 293 B du CGI ». Sinon : « Prix TTC ».
   */
  vatMention: "",
  /** Médiateur de la consommation (obligatoire pour vendre à des particuliers). */
  mediator: { name: "", url: "" },
  /** Date de dernière mise à jour des documents légaux. */
  lastUpdated: "2026-09-26",
} as const;

/** Hébergeur et prestataires techniques (informations publiques des prestataires). */
export const providers = {
  hosting: {
    name: "Vercel Inc.",
    address: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
    url: "https://vercel.com",
  },
  database: {
    name: "Supabase Inc.",
    detail: "base de données et authentification, hébergées dans l'Union européenne",
    url: "https://supabase.com",
  },
  payments: {
    name: "Stripe Payments Europe, Limited",
    address: "1 Grand Canal Street Lower, Grand Canal Dock, Dublin D02 H210, Irlande",
    url: "https://stripe.com/fr",
  },
  maps: {
    name: "CARTO et OpenStreetMap",
    detail: "fonds de carte",
    url: "https://carto.com/attributions",
  },
} as const;

/** Champs légaux encore vides (affichés « à compléter » sur le site). */
export function missingLegalFields() {
  const fields: [string, string][] = [
    ["publisherName", legal.publisherName],
    ["publisherStatus", legal.publisherStatus],
    ["siret", legal.siret],
    ["address", legal.address],
    ["email", legal.email],
    ["publicationDirector", legal.publicationDirector],
    ["vatMention", legal.vatMention],
    ["mediator", legal.mediator.name],
  ];
  return fields.filter(([, value]) => !value.trim()).map(([name]) => name);
}
