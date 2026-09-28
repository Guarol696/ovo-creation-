/**
 * Liens partenaires (affiliation Travelpayouts).
 *
 * `marker` est l'identifiant partenaire public du compte Travelpayouts d'OVO et
 * `projectId` celui du projet (le site ovovoyage.com). Ils apparaissent dans tous
 * les liens affiliés : ce ne sont pas des secrets.
 *
 * Pour qu'un partenaire rapporte une commission, recopier ici les paramètres
 * d'un lien créé avec le générateur de liens Travelpayouts pour ce partenaire
 * (ex. https://tp.media/r?marker=783013&trs=578967&p=4108&u=…&campaign_id=108 →
 * p "4108", campaignId "108"). Tant qu'ils sont vides, le lien
 * mène directement au site du partenaire, sans commission.
 */
export interface TravelpayoutsProgram {
  p: string;
  campaignId: string;
}

export const affiliate = {
  marker: "783013",
  projectId: "578967",
  /**
   * Script « Drive » de Travelpayouts (suivi des liens partenaires). Chargé
   * seulement après accord cookies, hors pages de compte et de paiement.
   */
  driveScriptSrc: "https://emrldtp.com/NTc4OTY3.js?t=578967",
  /** Vols : Aviasales lit directement le `marker` dans ses liens de recherche. */
  flights: { partner: "Aviasales" },
  hotels: { partner: "Booking.com", program: { p: "", campaignId: "" } },
  activities: { partner: "GetYourGuide", program: { p: "", campaignId: "" } },
} as const satisfies {
  marker: string;
  projectId: string;
  driveScriptSrc: string;
  flights: { partner: string };
  hotels: { partner: string; program: TravelpayoutsProgram };
  activities: { partner: string; program: TravelpayoutsProgram };
};
