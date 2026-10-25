/** Messages d'erreur Supabase Auth traduits (jamais de détail technique affiché). */
export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const status = (error as { status?: number })?.status;
  switch (code) {
    case "invalid_credentials":
      return "Email ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirme d'abord ton adresse email : le lien t'a été envoyé à l'inscription.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet email.";
    case "weak_password":
      return "Mot de passe trop faible : choisis-en un plus long.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives. Patiente quelques minutes avant de réessayer.";
    case "same_password":
      return "Le nouveau mot de passe doit être différent de l'ancien.";
  }
  if (status === 429) return "Trop de tentatives. Patiente quelques minutes avant de réessayer.";
  return "Le service de connexion ne répond pas. Réessaie dans un instant.";
}
