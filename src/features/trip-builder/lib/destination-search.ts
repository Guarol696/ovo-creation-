import { destinationCatalog } from "@/data/destination-catalog";
import type { DestinationPlace } from "@/types/trip";

/** Minuscules, sans accents ni ponctuation superflue. */
export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9' -]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Recherche dans le catalogue local : correspondances en début de mot d'abord,
 * puis correspondances partielles. Synchrone pour l'instant ; pourra devenir
 * un appel à une API de géocodage.
 */
export function searchDestinations(query: string, limit = 6): DestinationPlace[] {
  const q = normalizeText(query);
  if (!q) return [];

  const scored = destinationCatalog
    .map((entry) => {
      const names = [entry.name, ...(entry.aliases ?? [])].map(normalizeText);
      const country = normalizeText(entry.country);
      let score = 0;
      if (names.some((n) => n === q)) score = 4;
      else if (names.some((n) => n.startsWith(q) || n.split(" ").some((w) => w.startsWith(q)))) score = 3;
      else if (country.startsWith(q)) score = 2;
      else if (names.some((n) => n.includes(q)) || country.includes(q)) score = 1;
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name, "fr"));

  return scored.slice(0, limit).map(({ entry }) => toPlace(entry));
}

export function findDestinationById(id: string): DestinationPlace | null {
  const entry = destinationCatalog.find((item) => item.id === id);
  return entry ? toPlace(entry) : null;
}

/** Crée une destination libre à partir du texte saisi. */
export function createCustomDestination(name: string): DestinationPlace {
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 80);
  return { id: `custom:${normalizeText(clean)}`, name: clean, country: "", isCustom: true };
}

function toPlace({ id, name, country, countryCode }: DestinationPlace): DestinationPlace {
  return { id, name, country, countryCode };
}

/** Drapeau emoji à partir du code pays ISO. */
export function countryFlag(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return "📍";
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
