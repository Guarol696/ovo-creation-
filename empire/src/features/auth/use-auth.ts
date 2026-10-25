"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export interface AuthDisplay {
  status: "loading" | "anonymous" | "signed-in" | "unavailable";
  name?: string;
}

/**
 * État de connexion pour l'AFFICHAGE uniquement (en-tête, menus).
 * L'autorisation réelle est toujours vérifiée côté serveur.
 */
export function useAuth(): AuthDisplay {
  const [state, setState] = useState<AuthDisplay>({ status: isSupabaseConfigured() ? "loading" : "unavailable" });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const apply = (user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) =>
      setState(
        user
          ? {
              status: "signed-in",
              name: (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0],
            }
          : { status: "anonymous" },
      );
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}
