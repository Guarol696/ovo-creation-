"use client";

import type { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import type { PlanId } from "@/config/premium";
import { resolveEntitlements, SUBSCRIPTION_COLUMNS, type SubscriptionRow } from "@/features/premium/plan";
import { createClient } from "@/lib/supabase/client";

/**
 * État de connexion côté navigateur, pour l'affichage uniquement
 * (en-tête, bouton « Enregistrer »). Les autorisations sont toujours
 * vérifiées côté serveur et par les règles RLS de la base.
 *
 * - `loading` : session en cours de lecture → l'interface affiche un état neutre,
 *   jamais « déconnecté » par erreur ;
 * - `unavailable` : Supabase n'est pas configuré (les comptes sont désactivés).
 */
export type AuthStatus = "loading" | "authenticated" | "anonymous" | "unavailable";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  /**
   * Offre affichée (badge « ⭐ Medium » / « ✨ Premium »), lue depuis la table
   * `subscriptions` synchronisée avec Stripe (lecture seule pour l'utilisateur).
   * Affichage uniquement : les droits réels sont vérifiés par le serveur (`getEntitlements`).
   */
  plan: PlanId;
  /** Relit la session (après une action serveur qui l'a modifiée). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  plan: "free",
  refresh: async () => {},
});

function toSessionUser(session: Session | null): SessionUser | null {
  if (!session) return null;
  const { user } = session;
  const email = user.email ?? "";
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  return { id: user.id, email, displayName: name.trim() || email.split("@")[0] || "Voyageur" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [state, setState] = useState<{ status: AuthStatus; user: SessionUser | null }>(() => ({
    status: configured ? "loading" : "unavailable",
    user: null,
  }));
  const pathname = usePathname();
  const [planOf, setPlanOf] = useState<{ userId: string; plan: PlanId } | null>(null);
  const [planVersion, setPlanVersion] = useState(0);

  const apply = useCallback((session: Session | null) => {
    const user = toSessionUser(session);
    setState((current) =>
      current.status === (user ? "authenticated" : "anonymous") &&
      current.user?.id === user?.id &&
      current.user?.displayName === user?.displayName
        ? current
        : { status: user ? "authenticated" : "anonymous", user },
    );
  }, []);

  const refresh = useCallback(async () => {
    if (!configured) return;
    setPlanVersion((v) => v + 1);
    try {
      const { data } = await createClient().auth.getSession();
      apply(data.session);
    } catch {
      apply(null);
    }
  }, [configured, apply]);

  // Changements de session dans cet onglet ou un autre (connexion, déconnexion, rafraîchissement).
  useEffect(() => {
    if (!configured) return;
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) => apply(session));
    return () => subscription.unsubscribe();
  }, [configured, apply]);

  // Connexion et déconnexion passent par le serveur puis redirigent : on relit la session à chaque page.
  useEffect(() => {
    if (!configured) return;
    let active = true;
    createClient()
      .auth.getSession()
      .then(
        ({ data }) => active && apply(data.session),
        () => active && apply(null),
      );
    return () => {
      active = false;
    };
  }, [pathname, configured, apply]);

  // Plan de l'utilisateur connecté (relu à chaque changement de compte ou de page).
  const userId = state.user?.id ?? null;
  useEffect(() => {
    if (!configured || !userId) return;
    let active = true;
    createClient()
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle<SubscriptionRow>()
      .then(
        ({ data }) => active && setPlanOf({ userId, plan: resolveEntitlements(data).plan }),
        () => active && setPlanOf({ userId, plan: "free" }),
      );
    return () => {
      active = false;
    };
  }, [configured, userId, pathname, planVersion]);

  const plan: PlanId = userId && planOf?.userId === userId ? planOf.plan : "free";
  const value = useMemo(() => ({ ...state, plan, refresh }), [state, plan, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
