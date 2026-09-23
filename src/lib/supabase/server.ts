import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Client Supabase pour les Server Components, Server Actions et Route Handlers.
 * À créer à chaque requête (ne pas le partager globalement).
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component : ignorable tant que le
          // rafraîchissement de session est géré par le proxy (étape auth).
        }
      },
    },
  });
}
