/**
 * Traduit les erreurs de Supabase Auth en messages compréhensibles.
 * Le détail technique n'est jamais montré à l'utilisateur (seulement journalisé côté serveur).
 */

interface AuthLikeError {
  code?: string;
  status?: number;
  name?: string;
  message?: string;
}

export const GENERIC_ERROR = "Une erreur est survenue. Réessaie dans un instant.";
export const NETWORK_ERROR =
  "Impossible de joindre le service de comptes. Vérifie ta connexion internet et réessaie.";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  email_not_confirmed:
    "Ton adresse email n'est pas encore confirmée : clique sur le lien reçu par email pour activer ton compte.",
  user_already_exists: "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe.",
  email_exists: "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe.",
  weak_password:
    "Mot de passe trop faible : utilise au moins 8 caractères, avec des lettres et des chiffres, et évite les mots de passe trop courants.",
  same_password: "Choisis un mot de passe différent de l'ancien.",
  email_address_invalid: "Cette adresse email n'est pas valide.",
  email_address_not_authorized: "Cette adresse email ne peut pas être utilisée pour le moment.",
  signup_disabled: "Les inscriptions sont momentanément fermées. Réessaie plus tard.",
  over_request_rate_limit: "Trop de tentatives d'affilée. Patiente quelques minutes avant de réessayer.",
  over_email_send_rate_limit:
    "Trop d'emails envoyés à cette adresse. Patiente quelques minutes avant de réessayer.",
  otp_expired: "Ce lien a expiré ou a déjà été utilisé. Demande-en un nouveau.",
  flow_state_expired: "Ce lien a expiré. Demande-en un nouveau.",
  flow_state_not_found:
    "Ce lien n'est plus valide. Ouvre-le dans le navigateur où tu as fait la demande, ou demande-en un nouveau.",
  bad_code_verifier:
    "Ce lien doit être ouvert dans le navigateur où tu as fait la demande. Sinon, demande-en un nouveau.",
  session_not_found: "Ta session a expiré. Reconnecte-toi.",
  session_expired: "Ta session a expiré. Reconnecte-toi.",
  user_banned: "Ce compte est suspendu. Contacte-nous si tu penses qu'il s'agit d'une erreur.",
};

export function authErrorMessage(error: unknown): string {
  const e = (error ?? {}) as AuthLikeError;
  if (e.code && MESSAGES[e.code]) return MESSAGES[e.code]!;
  // Erreurs réseau (service injoignable, coupure) : pas de code HTTP exploitable.
  if (
    e.name === "AuthRetryableFetchError" ||
    e.status === 0 ||
    /fetch failed|network/i.test(e.message ?? "")
  ) {
    return NETWORK_ERROR;
  }
  if (e.status === 429) return MESSAGES.over_request_rate_limit!;
  if (e.status === 422 && /password/i.test(e.message ?? "")) return MESSAGES.weak_password!;
  return GENERIC_ERROR;
}
