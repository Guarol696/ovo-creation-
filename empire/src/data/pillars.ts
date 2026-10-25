export interface Pillar {
  slug: "learn" | "create" | "launch";
  index: string;
  title: string;
  headline: string;
  summary: string;
  body: string[];
  courses: string[];
  paths: string[];
}

export const pillars: Pillar[] = [
  {
    slug: "learn",
    index: "01",
    title: "Learn",
    headline: "Apprendre à créer et à développer de nouvelles compétences.",
    summary: "Des formations courtes et concrètes, écrites pour être appliquées le jour même.",
    body: [
      "Chaque leçon tient en une dizaine de minutes et se termine par un exercice appliqué à ton propre projet. On apprend en faisant, pas en accumulant des heures de vidéo.",
      "Les formations sont classées par niveau et par domaine : sites, intelligence artificielle, entrepreneuriat, applications, e-commerce, marketing, freelancing.",
    ],
    courses: ["ia-copilote", "proposition-de-valeur", "site-professionnel"],
    paths: ["premier-site-web"],
  },
  {
    slug: "create",
    index: "02",
    title: "Create",
    headline: "Construire des sites, des applications et des produits numériques.",
    summary: "Des livrables réels à chaque étape : arborescence, maquette, page rédigée, périmètre de V1.",
    body: [
      "Les parcours avancent par livrables : à la fin de chaque étape, tu as produit quelque chose d'utilisable — une page rédigée, un parcours dessiné, un tableau de marge.",
      "Le tableau de bord rassemble tes projets personnels et la progression de chaque formation, pour reprendre exactement là où tu t'es arrêté.",
    ],
    courses: ["landing-page", "premiere-application", "boutique-en-ligne"],
    paths: ["concevoir-une-application", "lancer-une-boutique"],
  },
  {
    slug: "launch",
    index: "03",
    title: "Launch",
    headline: "Lancer des projets, trouver des clients et développer une activité.",
    summary: "Positionnement, prospection, acquisition : ce qui transforme un projet en activité.",
    body: [
      "Un projet n'existe vraiment qu'une fois face à de vrais clients. Ce pilier couvre la proposition de valeur, la prospection, le lancement d'un produit et l'acquisition sur 90 jours.",
      "Les méthodes enseignées reposent sur des pratiques honnêtes : pas de faux avis, pas de fausse urgence, des chiffres mesurés plutôt que supposés.",
    ],
    courses: ["premiers-clients", "acquisition-90-jours", "produit-numerique"],
    paths: ["premiers-clients", "produit-numerique"],
  },
];

export const getPillar = (slug: string) => pillars.find((pillar) => pillar.slug === slug);
