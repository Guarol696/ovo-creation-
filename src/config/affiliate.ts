/**
 * Liens partenaires (affiliation Travelpayouts).
 *
 * `marker` est l'identifiant public du compte Travelpayouts d'OVO : il apparaît
 * dans tous les liens affiliés, ce n'est pas un secret.
 *
 * Pour qu'un partenaire rapporte une commission, recopier ici les paramètres
 * d'un lien créé avec le générateur de liens Travelpayouts pour ce partenaire
 * (ex. https://tp.media/r?marker=578967&trs=123456&p=4108&u=…&campaign_id=108 →
 * trs "123456", p "4108", campaignId "108"). Tant qu'ils sont vides, le lien
 * mène directement au site du partenaire, sans commission.
 */
export interface TravelpayoutsProgram {
  trs: string;
  p: string;
  campaignId: string;
}

export const affiliate = {
  marker: "578967",
  /** Vols : Aviasales lit directement le `marker` dans ses liens de recherche. */
  flights: { partner: "Aviasales" },
  hotels: { partner: "Booking.com", program: { trs: "", p: "", campaignId: "" } },
  activities: { partner: "GetYourGuide", program: { trs: "", p: "", campaignId: "" } },
} as const satisfies {
  marker: string;
  flights: { partner: string };
  hotels: { partner: string; program: TravelpayoutsProgram };
  activities: { partner: string; program: TravelpayoutsProgram };
};
