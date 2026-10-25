import type { LearningPath } from "@/types/academy";

/** Parcours entrepreneuriaux : étapes concrètes + ressources publiques réelles. */
export const paths: LearningPath[] = [
  {
    slug: "premier-site-web",
    index: "P1",
    title: "Créer son premier site web",
    promise: "Un site en ligne, avec un objectif, un nom de domaine et une première mesure d'audience.",
    outcome: "Un site professionnel publié et testé sur mobile.",
    weeks: 3,
    steps: [
      {
        title: "Écrire la phrase objectif",
        description: "« Ce site existe pour que [visiteur] puisse [action]. » Elle guide toutes les décisions.",
        course: "site-professionnel",
        resources: [],
      },
      {
        title: "Rédiger le contenu avant le design",
        description: "Les 5 questions du visiteur deviennent les 5 blocs de la page d'accueil.",
        course: "site-professionnel",
        resources: [{ label: "MDN — Structurer une page HTML", href: "https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Structuring_content" }],
      },
      {
        title: "Construire et publier",
        description: "Choisir l'outil selon qui maintiendra le site, puis mettre en ligne sur un domaine dédié.",
        resources: [{ label: "web.dev — Bases de la performance", href: "https://web.dev/learn/performance" }],
      },
      {
        title: "Être trouvé",
        description: "Titres de pages, fiche locale cohérente, test réel sur téléphone.",
        resources: [{ label: "Google Search Central — Guide de démarrage SEO", href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=fr" }],
      },
    ],
  },
  {
    slug: "lancer-une-boutique",
    index: "P2",
    title: "Lancer une boutique",
    promise: "Un catalogue resserré, une marge calculée et les dix premières ventes.",
    outcome: "Une boutique ouverte, des produits rentables, des premiers clients interrogés.",
    weeks: 6,
    steps: [
      {
        title: "Choisir trois produits",
        description: "Produit d'appel, produit cœur, complément.",
        course: "boutique-en-ligne",
        resources: [],
      },
      {
        title: "Calculer la marge réelle",
        description: "Tous les coûts variables, y compris paiement, emballage et retours.",
        course: "boutique-en-ligne",
        resources: [{ label: "Stripe — Tarification des paiements", href: "https://stripe.com/fr/pricing" }],
      },
      {
        title: "Écrire les fiches produit",
        description: "Chaque objection entendue devient une réponse sur la fiche.",
        resources: [],
      },
      {
        title: "Obtenir les 10 premières ventes",
        description: "Réseau, communautés, partenariats — avant toute publicité.",
        course: "boutique-en-ligne",
        resources: [],
      },
    ],
  },
  {
    slug: "concevoir-une-application",
    index: "P3",
    title: "Concevoir une application",
    promise: "Un problème validé, un parcours principal dessiné et une V1 réaliste.",
    outcome: "Un dossier de conception prêt à être construit.",
    weeks: 4,
    steps: [
      {
        title: "Écrire la phrase problème",
        description: "Utilisateur, situation, difficulté, contournement actuel.",
        course: "premiere-application",
        resources: [],
      },
      {
        title: "Interroger trois utilisateurs",
        description: "Faire raconter le passé, noter les contournements mot pour mot.",
        course: "proposition-de-valeur",
        resources: [],
      },
      {
        title: "Dessiner le parcours principal",
        description: "Moins de 7 écrans entre l'arrivée et le résultat.",
        course: "premiere-application",
        resources: [{ label: "W3C — Introduction à l'accessibilité web", href: "https://www.w3.org/WAI/fundamentals/accessibility-intro/fr" }],
      },
      {
        title: "Découper la V1",
        description: "Indispensable / utile / plus tard, et une date de test réel.",
        course: "premiere-application",
        resources: [],
      },
    ],
  },
  {
    slug: "premiers-clients",
    index: "P4",
    title: "Trouver ses premiers clients",
    promise: "Un positionnement clair, cinquante prospects et un rythme de prospection tenable.",
    outcome: "Des conversations commerciales régulières et un devis prêt à envoyer.",
    weeks: 4,
    steps: [
      {
        title: "Formuler le positionnement",
        description: "J'aide [client] à [résultat] grâce à [mécanisme].",
        course: "proposition-de-valeur",
        resources: [],
      },
      {
        title: "Construire la liste",
        description: "Cinquante prospects choisis, chacun avec une observation précise.",
        course: "premiers-clients",
        resources: [],
      },
      {
        title: "Prospecter chaque semaine",
        description: "Dix messages personnalisés par semaine, une relance maximum.",
        course: "premiers-clients",
        resources: [{ label: "CNIL — Prospection commerciale (B2B)", href: "https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique" }],
      },
      {
        title: "Envoyer un devis clair",
        description: "Périmètre, livrables, calendrier, conditions.",
        course: "premiers-clients",
        resources: [{ label: "Service-Public — Devis : mentions obligatoires", href: "https://entreprendre.service-public.fr/vosdroits/F31211" }],
      },
    ],
  },
  {
    slug: "produit-numerique",
    index: "P5",
    title: "Créer un produit numérique",
    promise: "Un produit validé par la pré-vente, tarifé et lancé en trois temps.",
    outcome: "Un produit en vente et une liste d'acheteurs à interroger.",
    weeks: 8,
    steps: [
      {
        title: "Choisir le problème",
        description: "Un problème précis, pour un public que tu sais atteindre.",
        course: "proposition-de-valeur",
        resources: [],
      },
      {
        title: "Valider par la pré-vente",
        description: "Un seuil de décision fixé à l'avance, remboursement garanti.",
        course: "produit-numerique",
        resources: [],
      },
      {
        title: "Produire la première version",
        description: "Le minimum qui tient la promesse, livré à la date annoncée.",
        course: "ia-copilote",
        resources: [],
      },
      {
        title: "Lancer en trois temps",
        description: "Annonce, ouverture, clôture — puis interroger acheteurs et non-acheteurs.",
        course: "produit-numerique",
        resources: [],
      },
    ],
  },
];

export const getPath = (slug: string) => paths.find((path) => path.slug === slug);
