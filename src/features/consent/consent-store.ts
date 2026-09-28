/**
 * Choix de l'utilisateur sur les cookies non essentiels (script partenaire
 * Travelpayouts). Gardé dans ce navigateur ; si le stockage est indisponible
 * (navigation privée…), le choix ne vaut que pour la visite en cours.
 */
export type ConsentChoice = "accepted" | "refused";

const STORAGE_KEY = "ovo:cookies:v1";
const CHANGE_EVENT = "ovo:consent-change";

/** Choix de la visite en cours, si le stockage refuse l'écriture. */
let sessionChoice: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "accepted" || value === "refused") return value;
  } catch {
    // Stockage indisponible : on se rabat sur le choix de la visite.
  }
  return sessionChoice;
}

export function saveConsent(choice: ConsentChoice | null) {
  sessionChoice = choice;
  try {
    if (choice) window.localStorage.setItem(STORAGE_KEY, choice);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Choix gardé seulement pour cette visite.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
