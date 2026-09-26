import { publicEnv } from "@/lib/env";

export const siteConfig = {
  name: "OVO",
  meaning: "Où On Va",
  title: "OVO — Où On Va ?",
  description:
    "Ton prochain voyage, imaginé selon tes envies et ton budget. Destination, transport, hébergement, activités et programme jour par jour.",
  url: publicEnv.siteUrl,
  locale: "fr_FR",
} as const;

export const routes = {
  home: "/",
  createTrip: "/voyage/nouveau",
  tripResult: "/voyage/resultat",
  sharedTrip: "/voyage/partage",
  login: "/connexion",
  signUp: "/inscription",
  forgotPassword: "/mot-de-passe-oublie",
  resetPassword: "/nouveau-mot-de-passe",
  authConfirm: "/auth/confirm",
  myTrips: "/mes-voyages",
  account: "/compte",
  about: "/a-propos",
  contact: "/contact",
  terms: "/conditions",
  privacy: "/confidentialite",
  legalNotice: "/mentions-legales",
  discover: "/#decouvrir",
  howItWorks: "/#comment-ca-marche",
  premium: "/premium",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Accueil", href: routes.home },
  { label: "Créer un voyage", href: routes.createTrip },
  { label: "Mes voyages", href: routes.myTrips },
  { label: "Premium", href: routes.premium },
];

/** Pages réservées aux utilisateurs connectés (vérifiées aussi côté serveur dans chaque page). */
export const protectedRoutes = [routes.myTrips, routes.account] as const;

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "OVO",
    links: [
      { label: "À propos", href: routes.about },
      { label: "Comment ça marche", href: routes.howItWorks },
      { label: "Premium", href: routes.premium },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Contact", href: routes.contact },
      { label: "Conditions", href: routes.terms },
      { label: "Confidentialité", href: routes.privacy },
      { label: "Mentions légales", href: routes.legalNotice },
    ],
  },
];

/** Liens sociaux : renseigner les URL quand les comptes existent. */
export const socialLinks = {
  instagram: "",
  tiktok: "",
} as const;
