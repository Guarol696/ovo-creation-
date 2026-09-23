/**
 * Accès centralisé aux variables d'environnement publiques.
 * Les variables NEXT_PUBLIC_* doivent être lues de façon statique
 * pour être intégrées au bundle client par Next.js.
 */
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Clé publiable Stripe (pk_…) : publique par conception, jamais la clé secrète. */
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  /** Fond de carte raster (gratuit par défaut : CARTO, données © OpenStreetMap). */
  mapTilesUrl:
    process.env.NEXT_PUBLIC_MAP_TILES_URL ?? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  mapAttribution:
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
