/** Durées proposées pour un lien de partage (7 et 30 jours : OVO Premium). */
export const SHARE_DURATIONS = {
  unlimited: { label: "Sans limite", days: null },
  "7d": { label: "7 jours", days: 7 },
  "30d": { label: "30 jours", days: 30 },
} as const satisfies Record<string, { label: string; days: number | null }>;

export type ShareDuration = keyof typeof SHARE_DURATIONS;
