/**
 * Accès centralisé aux variables d'environnement publiques.
 * Les variables NEXT_PUBLIC_* doivent être lues de façon statique
 * pour être intégrées au bundle client par Next.js.
 */
/**
 * URL publique du site (liens des emails, retours Stripe, partage).
 * Ordre : NEXT_PUBLIC_SITE_URL (domaine choisi) → URL de production Vercel
 * → URL du déploiement Vercel → localhost en développement.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelProduction = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;
  const vercelDeployment = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelDeployment) return `https://${vercelDeployment}`;
  return "http://localhost:3000";
}

/**
 * Adresse du projet Supabase réduite à son origine (`https://xxxx.supabase.co`) :
 * tolère une adresse collée avec un chemin (`/rest/v1/`) ou une barre finale,
 * qui ferait échouer tous les appels (« Invalid path specified in request URL »).
 */
export function normalizeSupabaseUrl(raw: string | undefined) {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(),
  supabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
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
