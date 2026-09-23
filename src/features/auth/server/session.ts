import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export function toAppUser(user: User): AppUser {
  const email = user.email ?? "";
  const name = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  return {
    id: user.id,
    email,
    displayName: name.trim() || email.split("@")[0] || "Voyageur",
    createdAt: user.created_at,
  };
}

/**
 * Utilisateur connecté, vérifié auprès de Supabase Auth (jamais sur la seule
 * foi du cookie). `null` si personne n'est connecté ou si les comptes ne sont
 * pas configurés. Mis en cache pour la durée d'une requête.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? toAppUser(user) : null;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[auth] lecture de la session impossible", error);
    return null;
  }
});
