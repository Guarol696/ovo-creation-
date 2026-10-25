import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { planById } from "@/config/plans";
import { routes } from "@/config/site";
import { signOut } from "@/features/auth/actions";
import { openBillingPortal } from "@/features/billing/actions";
import { DisplayPreferencesForm } from "@/features/settings/display-preferences";
import { ProfileForm } from "@/features/settings/profile-form";
import { displayName, getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { loginUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Réglages", robots: { index: false } };

function Panel({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-8 border-t hairline py-10 md:grid-cols-[18rem_1fr] md:gap-12">
      <div>
        <h2 id={id} className="font-display text-xl font-bold [font-stretch:110%]">{title}</h2>
        <p className="mt-2 text-sm text-mist">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  if (configured && !user) redirect(loginUrl(routes.settings));
  const plan = await getUserPlan(user?.id);

  return (
    <div className="shell pt-[calc(var(--header-h)+2.5rem)] pb-24">
      <p className="meta text-mist">Mon espace</p>
      <h1 className="font-expanded mt-3 text-[clamp(2rem,5vw,3.75rem)]">Réglages</h1>

      <div className="mt-8 grid gap-3">
        {params.motdepasse && <Notice title="Mot de passe modifié">Ton nouveau mot de passe est actif.</Notice>}
        {params.erreur === "portail" && <Notice tone="error" title="Portail indisponible">Le portail de facturation n&apos;a pas pu être ouvert (aucun abonnement Stripe associé, ou paiements non configurés).</Notice>}
        {!configured && (
          <Notice tone="demo" title="Mode démonstration">
            Les comptes ne sont pas configurés : seules les préférences d&apos;affichage (enregistrées sur cet appareil) sont disponibles.
          </Notice>
        )}
      </div>

      <div className="mt-10">
        {user && (
          <Panel id="profile" title="Profil" description="Le nom affiché dans ton espace.">
            <ProfileForm displayName={displayName(user)} email={user.email ?? ""} />
          </Panel>
        )}

        <Panel id="display" title="Accessibilité & animations" description="Préférences propres à cet appareil, appliquées immédiatement.">
          <DisplayPreferencesForm />
        </Panel>

        {user && (
          <>
            <Panel id="plan" title="Abonnement" description="Ton offre est confirmée par Stripe ; elle se gère dans le portail sécurisé.">
              <div className="grid gap-4">
                <p>
                  Offre actuelle : <strong>{planById(plan).name}</strong>
                </p>
                <div className="flex flex-wrap gap-3">
                  {plan === "free" ? (
                    <Link href={routes.pricing} className="meta inline-flex min-h-12 items-center border hairline px-5 hover:border-paper">
                      Voir les offres
                    </Link>
                  ) : (
                    <form action={openBillingPortal}>
                      <Button type="submit" variant="outline" arrow>
                        Gérer l&apos;abonnement
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </Panel>

            <Panel id="security" title="Compte & sessions" description="Mot de passe et appareils connectés.">
              <div className="grid gap-6">
                <div>
                  <p className="font-medium">Mot de passe</p>
                  <p className="mt-1 text-sm text-mist">Un lien de réinitialisation est envoyé à ton adresse email.</p>
                  <Link href={routes.forgotPassword} className="meta mt-3 inline-flex min-h-11 items-center border-b border-paper/30 hover:border-volt hover:text-volt">
                    Changer de mot de passe
                  </Link>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={signOut}>
                    <Button type="submit" variant="outline">Se déconnecter</Button>
                  </form>
                  <form action={signOut}>
                    <input type="hidden" name="scope" value="global" />
                    <Button type="submit" variant="ghost">Déconnecter tous les appareils</Button>
                  </form>
                </div>
                <p className="text-sm text-mist">
                  Suppression du compte : écris-nous depuis la page <Link href={routes.contact} className="underline underline-offset-2">contact</Link>.
                </p>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
