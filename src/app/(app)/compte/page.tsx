import { KeyRound, LogOut, Map } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { routes } from "@/config/site";
import { signOut } from "@/features/auth/actions";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { FormMessage } from "@/features/auth/components/form-controls";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { param } from "@/features/auth/page-params";
import { getCurrentUser } from "@/features/auth/server/session";
import { isPaidPlan, PLANS } from "@/config/premium";
import { PortalReturnNotice } from "@/features/billing/components/portal-return-notice";
import { SubscriptionCard } from "@/features/billing/components/subscription-card";
import { getPlanPrices } from "@/features/billing/server/prices";
import { PlanBadge } from "@/features/premium/components/premium-badge";
import { getEntitlements } from "@/features/premium/server/entitlements";
import { MySpaceHeader } from "@/features/saved-trips/components/my-space-header";
import { countSavedTrips } from "@/features/saved-trips/server/repository";
import { authUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false, follow: false } };

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const user = await getCurrentUser();
  if (!user) redirect(authUrl(routes.login, routes.account));

  const supabase = await createClient();
  const [tripsCount, profile, entitlements, planPrices] = await Promise.all([
    countSavedTrips(supabase).catch(() => null),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle<{ display_name: string }>()
      .then(({ data }) => data),
    getEntitlements(),
    getPlanPrices(),
  ]);
  const { limits } = entitlements;
  const plan = PLANS[entitlements.plan];
  const displayName = profile?.display_name ?? user.displayName;
  const query = await searchParams;
  const passwordChanged = param(query.motdepasse) === "modifie";
  const fromPortal = param(query.retour) === "portail";

  const card = "rounded-4xl bg-white/[0.05] p-5 ring-1 ring-white/10 sm:p-7";
  return (
    <div className="flex-1 bg-night-950 text-white">
      <MySpaceHeader
        eyebrow="Mon espace"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Mon profil <PlanBadge plan={entitlements.plan} />
          </span>
        }
        description={`Membre depuis ${memberSince.format(new Date(user.createdAt))}.`}
      />
      <Container className="grid max-w-5xl grid-cols-1 gap-5 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {fromPortal && (
          <div className="lg:col-span-2">
            <PortalReturnNotice />
          </div>
        )}
        <div className="min-w-0 space-y-5">
          {passwordChanged && <FormMessage tone="success">Ton mot de passe a bien été modifié ✓</FormMessage>}
          <section aria-labelledby="profil-infos" className={card}>
            <h2 id="profil-infos" className="font-display text-xl font-bold">
              Mes informations
            </h2>
            <dl className="mt-4 mb-6 text-sm">
              <dt className="text-night-100/60">Email</dt>
              <dd className="mt-1 font-semibold break-all">{user.email}</dd>
            </dl>
            <ProfileForm displayName={displayName} />
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <SubscriptionCard
            entitlements={entitlements}
            price={isPaidPlan(entitlements.plan) ? planPrices.prices[entitlements.plan] : null}
          />
          <section aria-labelledby="profil-voyages" className={card}>
            <h2 id="profil-voyages" className="font-display text-xl font-bold">
              Mes voyages
            </h2>
            <p className="mt-2 text-night-100/75">
              {tripsCount === null
                ? "Retrouve tous tes voyages enregistrés."
                : tripsCount === 0
                  ? "Aucun voyage enregistré pour l'instant."
                  : `${tripsCount} voyage${tripsCount > 1 ? "s" : ""} enregistré${tripsCount > 1 ? "s" : ""}.`}
            </p>
            {tripsCount !== null && limits.savedTrips !== null && (
              <p className="mt-1 text-xs text-night-100/55">
                {tripsCount} / {limits.savedTrips} avec {plan.name}
              </p>
            )}
            <ButtonLink href={routes.myTrips} className="mt-5 w-full">
              <Map className="size-4" /> Voir mes voyages
            </ButtonLink>
          </section>
          <section aria-labelledby="profil-securite" className={card}>
            <h2 id="profil-securite" className="font-display text-xl font-bold">
              Sécurité
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              <ButtonLink
                href={routes.resetPassword}
                variant="outline-light"
                className="w-full text-center whitespace-normal"
              >
                <KeyRound className="size-4" /> Changer mon mot de passe
              </ButtonLink>
              <form action={signOut}>
                <Button type="submit" variant="ghost-light" className="w-full">
                  <LogOut className="size-4" /> Déconnexion
                </Button>
              </form>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
