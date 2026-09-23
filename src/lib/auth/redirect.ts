import { routes } from "@/config/site";

/** Paramètre d'URL portant la page où revenir après connexion. */
export const NEXT_PARAM = "next";
/** Paramètre ajouté à l'URL d'un voyage : « enregistre-le dès que je suis connecté ». */
export const SAVE_INTENT_PARAM = "enregistrer";

const BASE = "http://ovo.local";

/**
 * Chemin de retour sûr : uniquement une page interne (jamais un autre site,
 * ni « //exemple.com », ni une URL javascript:). Sinon, valeur par défaut.
 */
export function safeNextPath(value: unknown, fallback: string = routes.myTrips): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** Lien vers une page d'authentification avec retour vers `next`. */
export function authUrl(page: string, next?: string | null) {
  if (!next) return page;
  return `${page}?${new URLSearchParams({ [NEXT_PARAM]: safeNextPath(next) })}`;
}

/** Ajoute l'intention « enregistrer ce voyage » à l'URL d'un résultat. */
export function withSaveIntent(path: string) {
  const url = new URL(path, BASE);
  url.searchParams.set(SAVE_INTENT_PARAM, "1");
  return `${url.pathname}${url.search}${url.hash}`;
}
