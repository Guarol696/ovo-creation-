import { SAVE_INTENT_PARAM } from "@/lib/auth/redirect";

/** Valeur simple d'un paramètre d'URL (ignore les tableaux). */
export const param = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/** Le visiteur arrive ici pour enregistrer un voyage (lien « Enregistrer mon voyage »). */
export const isSaveIntent = (next: string) => next.includes(`${SAVE_INTENT_PARAM}=1`);
