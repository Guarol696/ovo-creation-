/**
 * Accès centralisé aux variables d'environnement publiques.
 * Les variables NEXT_PUBLIC_* doivent être lues de façon statique
 * pour être intégrées au bundle client par Next.js.
 */
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function getSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase n'est pas configuré : renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local",
    );
  }
  return { url: publicEnv.supabaseUrl, anonKey: publicEnv.supabaseAnonKey };
}
