/** Exemples de projets réalisables (section « Build something real »). */
export interface ProjectExample {
  slug: "site" | "boutique" | "application" | "marque" | "produit" | "entreprise";
  label: string;
  title: string;
  example: string;
  deliverables: string[];
  path: string;
}

export const projectExamples: ProjectExample[] = [
  {
    slug: "site",
    label: "Site professionnel",
    title: "Le site d'un cabinet de kiné",
    example: "Prise de rendez-vous en ligne, fiche locale, 5 pages écrites à partir des questions des patients.",
    deliverables: ["Phrase objectif", "Arborescence 5 pages", "Page d'accueil rédigée", "Mise en ligne + domaine"],
    path: "premier-site-web",
  },
  {
    slug: "boutique",
    label: "Boutique en ligne",
    title: "Une boutique de céramique",
    example: "Trois produits, marge calculée ligne par ligne, dix premières ventes obtenues sans publicité.",
    deliverables: ["Catalogue de lancement", "Tableau de marge", "Fiches produit", "Plan des 10 ventes"],
    path: "lancer-une-boutique",
  },
  {
    slug: "application",
    label: "Application",
    title: "Une app de planning pour clubs",
    example: "Remplacer le tableur partagé d'un club amateur : parcours en 5 écrans, V1 testée par 3 coachs.",
    deliverables: ["Phrase problème", "3 entretiens", "Parcours principal", "Périmètre V1"],
    path: "concevoir-une-application",
  },
  {
    slug: "marque",
    label: "Marque",
    title: "Une marque de repas pour sportifs",
    example: "Client cible précis, proposition de valeur testée, nom et ton de voix choisis avec méthode.",
    deliverables: ["Client cible", "Proposition de valeur", "Plateforme de marque", "Page de test"],
    path: "premiers-clients",
  },
  {
    slug: "produit",
    label: "Produit numérique",
    title: "Un guide pour freelances",
    example: "Un guide de devis validé par 20 pré-ventes avant d'être écrit, lancé en trois temps.",
    deliverables: ["Problème choisi", "Page de pré-vente", "Première version", "Plan de lancement"],
    path: "produit-numerique",
  },
  {
    slug: "entreprise",
    label: "Projet entrepreneurial",
    title: "Une activité de freelance web",
    example: "Positionnement clair, 50 prospects qualifiés, rythme de prospection et devis types.",
    deliverables: ["Positionnement", "Liste de prospects", "Messages types", "Modèle de devis"],
    path: "premiers-clients",
  },
];
