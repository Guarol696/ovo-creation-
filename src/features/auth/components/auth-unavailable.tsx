import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";
import { AuthShell } from "./auth-shell";

/** Supabase non configuré : OVO reste utilisable, seuls les comptes sont désactivés. */
export function AuthUnavailable() {
  return (
    <AuthShell
      eyebrow="Compte OVO"
      title="Les comptes arrivent très bientôt."
      description="Cette version d'OVO fonctionne sans compte : crée ton voyage, et garde le lien de la page de résultat pour le retrouver."
    >
      <ButtonLink href={routes.createTrip} size="lg" className="w-full">
        Créer mon voyage
      </ButtonLink>
    </AuthShell>
  );
}
