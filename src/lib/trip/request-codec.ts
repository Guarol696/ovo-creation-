import type { TripRequest } from "@/types/trip";

/**
 * Encodage compact d'une demande de voyage dans l'URL (base64url du JSON).
 * Permet d'afficher, recharger et partager un résultat sans base de données.
 * Le décodage ne fait AUCUNE confiance au contenu : valider ensuite avec zod.
 */

const MAX_ENCODED_LENGTH = 6000;

export function encodeTripRequest(request: TripRequest): string {
  const bytes = new TextEncoder().encode(JSON.stringify(request));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTripRequestParam(value: string): unknown {
  if (!value || value.length > MAX_ENCODED_LENGTH || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
