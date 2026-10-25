/**
 * Identité de la plateforme. « EMPIRE » est un nom de travail : tout le site lit
 * ces valeurs, il suffit de les modifier ici (ou via NEXT_PUBLIC_BRAND_NAME).
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "EMPIRE",
  tagline: "Learn the skills. Build the product. Create your future.",
  description:
    "Académie pour apprendre à entreprendre : créer des sites, concevoir des applications, lancer des projets et développer une activité.",
  locale: "fr_FR",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
} as const;

export const routes = {
  home: "/",
  academy: "/academy",
  course: (slug: string) => `/academy/${slug}`,
  lesson: (course: string, lesson: string) => `/learn/${course}/${lesson}`,
  paths: "/paths",
  path: (slug: string) => `/paths/${slug}`,
  pillar: (slug: string) => `/pillars/${slug}`,
  assistant: "/assistant",
  dashboard: "/dashboard",
  settings: "/settings",
  pricing: "/pricing",
  billingSuccess: "/billing/success",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  authConfirm: "/auth/confirm",
  about: "/about",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
} as const;

/** Pages réservées aux comptes connectés (quand Supabase est configuré). */
export const protectedRoutes = [routes.dashboard, routes.settings] as const;

export const mainNav = [
  { label: "Academy", href: routes.academy, index: "01" },
  { label: "Parcours", href: routes.paths, index: "02" },
  { label: "Assistant", href: routes.assistant, index: "03" },
  { label: "Tarifs", href: routes.pricing, index: "04" },
] as const;

/**
 * Réseaux sociaux : affichés uniquement si leur URL est renseignée
 * (aucun lien factice).
 */
export const socialLinks = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM },
  { label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE },
  { label: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN },
  { label: "X", href: process.env.NEXT_PUBLIC_SOCIAL_X },
].filter((link): link is { label: string; href: string } => Boolean(link.href?.trim()));
