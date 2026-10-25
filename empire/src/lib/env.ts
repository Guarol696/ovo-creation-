/**
 * Accès centralisé à la configuration. Les variables NEXT_PUBLIC_* sont lues
 * de façon statique pour être intégrées au bundle navigateur ; toutes les
 * autres ne sont lisibles que côté serveur.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && /^https?:\/\/[^/\s]+/.test(explicit)) return explicit.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

function origin(raw: string | undefined) {
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
  supabaseUrl: origin(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
} as const;

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function getSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase n'est pas configuré : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return { url: publicEnv.supabaseUrl, anonKey: publicEnv.supabaseAnonKey };
}
