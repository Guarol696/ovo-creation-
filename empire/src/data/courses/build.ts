import type { Course } from "@/types/academy";

/** Formations « construire » : sites, applications, e-commerce. Contenus de démonstration. */
export const buildCourses: Course[] = [
  {
    slug: "site-professionnel",
    title: "Créer le site d'un professionnel",
    tagline: "Du brief à la mise en ligne, pour un artisan, un coach ou un cabinet.",
    description:
      "Un site professionnel n'est pas une vitrine : c'est un outil qui doit produire des demandes de contact. Cette formation suit un cas concret — le site d'une kinésithérapeute indépendante — de la définition de l'objectif à la mise en ligne.",
    category: "sites-web",
    level: "debutant",
    access: "free",
    objectives: [
      "Définir l'objectif unique du site et la page qui le sert",
      "Écrire une page d'accueil qui répond aux questions d'un visiteur en 10 secondes",
      "Choisir un outil adapté (no-code ou code) sans sur-dimensionner",
      "Mettre en ligne avec un nom de domaine et une fiche locale cohérente",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-20",
    modules: [
      {
        slug: "cadrer",
        title: "Cadrer le projet",
        lessons: [
          {
            slug: "objectif-unique",
            title: "Un site, un objectif",
            minutes: 9,
            summary: "Choisir l'action principale que le site doit déclencher.",
            video: "bunny",
            body: [
              "Avant la moindre maquette, écris une phrase : « Ce site existe pour que [visiteur] puisse [action] ». Pour notre kinésithérapeute : « pour qu'un patient du quartier puisse prendre rendez-vous sans téléphoner ».",
              "Cette phrase tranche toutes les décisions suivantes. Une galerie photo aide-t-elle à prendre rendez-vous ? Non : elle passe en bas de page ou disparaît.",
              "— Action principale : prendre rendez-vous (bouton visible sur chaque page).",
              "— Action secondaire : appeler ou trouver l'adresse.",
              "— Tout le reste est du contexte qui rassure.",
              "Exercice : rédige la phrase pour ton propre projet, puis liste trois éléments que tu voulais mettre et qui ne la servent pas.",
            ],
          },
          {
            slug: "questions-visiteur",
            title: "Les 5 questions du visiteur",
            minutes: 11,
            summary: "Structurer le contenu à partir de ce que le visiteur cherche vraiment.",
            body: [
              "Un visiteur arrive avec cinq questions, presque toujours dans cet ordre : Est-ce que c'est pour moi ? Est-ce sérieux ? Combien ça coûte ? Où et quand ? Comment je commence ?",
              "Chaque question devient un bloc de la page d'accueil. « Pour moi ? » : un titre qui nomme le public et le résultat (« Kinésithérapie du sport à Lyon 7e »). « Sérieux ? » : diplômes, années d'expérience, photos réelles du cabinet.",
              "— Prix : affiche une fourchette ou le tarif conventionné. L'absence de prix fait fuir.",
              "— Où / quand : adresse, carte, horaires, accessibilité.",
              "— Commencer : le bouton de l'action principale, répété.",
              "Les avis clients ne s'inventent jamais : si tu n'en as pas encore, n'affiche pas de bloc vide, ajoute-le plus tard.",
            ],
          },
        ],
      },
      {
        slug: "construire",
        title: "Construire les pages",
        lessons: [
          {
            slug: "page-accueil",
            title: "Écrire la page d'accueil",
            minutes: 14,
            summary: "Titre, preuve, offre, appel à l'action : la structure qui fonctionne.",
            video: "dream",
            body: [
              "Commence par le texte, jamais par le design. Un bon titre fait moins de dix mots et contient le métier, le public ou le lieu, et le résultat.",
              "Sous le titre, une phrase qui précise ce qui te différencie, puis le bouton principal. Ce trio doit être visible sans défiler, y compris sur un téléphone de 360 px de large.",
              "— Bloc 2 : les prestations, trois maximum, chacune avec un résultat concret.",
              "— Bloc 3 : la preuve (parcours, photos, certifications).",
              "— Bloc 4 : infos pratiques et rappel du bouton.",
              "Relis chaque phrase en te demandant : « Et alors ? ». Si la phrase ne survit pas à la question, supprime-la.",
            ],
          },
          {
            slug: "choisir-outil",
            title: "Choisir son outil",
            minutes: 10,
            summary: "No-code, CMS ou code : le bon outil dépend de qui maintiendra le site.",
            body: [
              "La question décisive n'est pas « quel outil est le meilleur ? » mais « qui modifiera le site dans six mois ? ». Si c'est le client lui-même, privilégie un outil qu'il peut éditer seul.",
              "— Site de 3 à 6 pages, client autonome : un constructeur no-code.",
              "— Blog ou contenus fréquents : un CMS.",
              "— Besoin sur mesure (réservation intégrée, espace client) : du code, ou un outil no-code avec intégrations.",
              "Note le coût mensuel total (outil + domaine + extensions) et présente-le au client dès le devis.",
            ],
          },
        ],
      },
      {
        slug: "mettre-en-ligne",
        title: "Mettre en ligne",
        lessons: [
          {
            slug: "domaine-et-local",
            title: "Domaine, fiche locale et premières visites",
            minutes: 12,
            summary: "Les réglages qui font qu'un site local est trouvé.",
            body: [
              "Choisis un domaine court, sans tiret si possible, au nom du professionnel ou du cabinet. Configure l'adresse email sur ce domaine : c'est un signal de sérieux.",
              "Pour une activité locale, la fiche d'établissement des moteurs de recherche compte souvent plus que le site lui-même. Nom, adresse et téléphone doivent être strictement identiques partout.",
              "— Vérifie le titre et la description de chaque page.",
              "— Teste le site sur un vrai téléphone, en 4G.",
              "— Installe une mesure d'audience respectueuse de la vie privée.",
              "Checklist finale : formulaire testé, mentions légales présentes, bouton principal visible sur chaque page.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "landing-page",
    title: "Construire une landing page qui convertit",
    tagline: "Une page, une offre, une action — et des chiffres pour l'améliorer.",
    description:
      "La landing page est l'outil le plus rentable d'un lancement. Vous apprendrez à structurer une page autour d'une offre unique, à écrire des titres testables et à mesurer ce qui se passe réellement.",
    category: "sites-web",
    level: "intermediaire",
    access: "pro",
    objectives: [
      "Structurer une page autour d'une seule conversion",
      "Écrire trois variantes de titre et savoir laquelle tester",
      "Installer une mesure fiable du taux de conversion",
      "Itérer à partir des données, pas des opinions",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-18",
    modules: [
      {
        slug: "structure",
        title: "Structure",
        lessons: [
          {
            slug: "anatomie",
            title: "Anatomie d'une landing page",
            minutes: 12,
            summary: "Promesse, mécanisme, preuve, offre, objections, action.",
            video: "steel",
            body: [
              "Une landing page répond à une seule intention de visite. Retire la navigation principale : chaque lien est une sortie.",
              "— Promesse : le résultat obtenu, dans les mots du client.",
              "— Mécanisme : pourquoi ça marche (ton approche, ta méthode).",
              "— Preuve : démonstration, captures, études de cas réelles.",
              "— Offre : ce qui est inclus, le prix, la garantie éventuelle.",
              "— Objections : une FAQ honnête.",
              "Chaque bloc se termine par le même bouton, avec le même libellé.",
            ],
          },
          {
            slug: "titres",
            title: "Écrire des titres testables",
            minutes: 9,
            summary: "Trois angles de titre et comment choisir.",
            body: [
              "Écris trois titres selon trois angles : le résultat (« Lancez votre boutique en 30 jours »), la douleur (« Fini les ventes qui dépendent d'Instagram »), le mécanisme (« La méthode des 3 produits pour lancer une boutique »).",
              "Ne teste qu'une variable à la fois, et seulement avec assez de trafic : en dessous de quelques centaines de visites par variante, observe plutôt les enregistrements de session et les retours qualitatifs.",
            ],
          },
        ],
      },
      {
        slug: "mesure",
        title: "Mesurer et itérer",
        lessons: [
          {
            slug: "mesure-conversion",
            title: "Mesurer une conversion",
            minutes: 11,
            summary: "Définir l'événement, le suivre, lire les chiffres.",
            body: [
              "Une conversion est un événement précis : formulaire envoyé, paiement confirmé, rendez-vous réservé. Un clic sur le bouton n'est pas une conversion.",
              "Le taux de conversion se lit par source de trafic : une page à 2 % en moyenne peut être à 8 % pour le trafic d'une newsletter et à 0,5 % pour la publicité.",
              "— Note chaque modification et sa date dans un journal.",
              "— Compare des périodes de même durée.",
              "— Méfie-toi des conclusions tirées sur moins d'une semaine.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "premiere-application",
    title: "Concevoir sa première application",
    tagline: "Du problème au périmètre d'une V1 que l'on peut vraiment construire.",
    description:
      "La plupart des projets d'application échouent avant la première ligne de code : périmètre trop large, utilisateur flou. Vous apprendrez à définir un problème, un parcours principal et une V1 réaliste.",
    category: "applications",
    level: "intermediaire",
    access: "pro",
    objectives: [
      "Formuler le problème et l'utilisateur cible en une phrase",
      "Dessiner le parcours principal en moins de 7 écrans",
      "Découper une V1 réaliste et une liste « plus tard »",
      "Choisir une approche technique adaptée (no-code, low-code, code)",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-12",
    modules: [
      {
        slug: "probleme",
        title: "Le problème avant la solution",
        lessons: [
          {
            slug: "phrase-probleme",
            title: "La phrase problème",
            minutes: 10,
            summary: "Qui, quelle situation, quelle difficulté, quelle solution actuelle.",
            video: "sintel",
            body: [
              "Complète : « Quand [situation], [utilisateur] a du mal à [tâche], aujourd'hui il [solution de contournement], ce qui lui coûte [temps/argent/stress] ».",
              "La solution de contournement est la partie la plus importante : un tableur, des messages, un carnet. Ton application doit être nettement meilleure qu'elle, pas seulement plus jolie.",
              "Exercice : interroge trois personnes concernées et note leurs contournements mot pour mot.",
            ],
          },
          {
            slug: "parcours-principal",
            title: "Le parcours principal",
            minutes: 13,
            summary: "Les écrans indispensables pour accomplir la tâche une fois.",
            body: [
              "Dessine sur papier le chemin minimal : l'utilisateur arrive, accomplit la tâche, voit le résultat. Chaque écran est une boîte, chaque action une flèche.",
              "— Plus de 7 écrans : le périmètre est trop large.",
              "— Un écran sans action : il peut sûrement fusionner avec un autre.",
              "— L'inscription peut souvent arriver après la première valeur.",
            ],
          },
        ],
      },
      {
        slug: "v1",
        title: "Définir la V1",
        lessons: [
          {
            slug: "perimetre",
            title: "Découper le périmètre",
            minutes: 12,
            summary: "Indispensable, utile, plus tard : la règle des trois colonnes.",
            body: [
              "Liste toutes les fonctionnalités imaginées, puis classe-les en trois colonnes. Est « indispensable » ce sans quoi le parcours principal est impossible.",
              "La V1 contient uniquement la première colonne, plus ce qui protège les données (comptes, sauvegardes, droits d'accès).",
              "Fixe une date de mise entre les mains de vrais utilisateurs, et réduis le périmètre plutôt que de repousser la date.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "boutique-en-ligne",
    title: "Lancer une boutique en ligne",
    tagline: "Catalogue, paiement, livraison : une boutique qui vend dès le premier mois.",
    description:
      "Monter une boutique est devenu simple techniquement ; vendre ne l'est pas. Cette formation se concentre sur les décisions qui comptent : catalogue resserré, fiches produit, frais de livraison, premières ventes.",
    category: "e-commerce",
    level: "intermediaire",
    access: "pro",
    objectives: [
      "Choisir un catalogue de lancement resserré",
      "Écrire des fiches produit qui répondent aux objections",
      "Fixer prix et frais de livraison sans perdre de marge",
      "Obtenir les 10 premières ventes hors publicité",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-15",
    modules: [
      {
        slug: "catalogue",
        title: "Catalogue et marge",
        lessons: [
          {
            slug: "trois-produits",
            title: "Lancer avec trois produits",
            minutes: 10,
            summary: "Pourquoi un petit catalogue vend mieux au lancement.",
            video: "bunny",
            body: [
              "Au lancement, chaque produit demande des photos, une fiche, du stock et de l'attention. Trois produits bien présentés vendent davantage que trente produits survolés.",
              "— Un produit d'appel, simple à acheter.",
              "— Un produit cœur, qui porte la marge.",
              "— Un complément, qui augmente le panier.",
            ],
          },
          {
            slug: "calcul-marge",
            title: "Calculer sa marge réelle",
            minutes: 12,
            summary: "Coût produit, paiement, emballage, livraison, retours.",
            body: [
              "La marge réelle se calcule après tous les coûts variables : coût d'achat ou de fabrication, frais de paiement, emballage, part de livraison offerte, retours et casse.",
              "Construis un tableau avec une ligne par produit et vérifie qu'il reste une marge suffisante pour financer l'acquisition de clients. Si ce n'est pas le cas, change le prix ou le produit, pas le tableau.",
            ],
          },
        ],
      },
      {
        slug: "premieres-ventes",
        title: "Premières ventes",
        lessons: [
          {
            slug: "dix-ventes",
            title: "Les 10 premières ventes",
            minutes: 11,
            summary: "Réseau, communautés, partenariats : vendre avant de payer de la publicité.",
            body: [
              "Les dix premières ventes servent à apprendre, pas à rentabiliser. Contacte personnellement des personnes concernées, demande-leur pourquoi elles achètent ou non.",
              "— Prépare une liste de 50 personnes ou communautés pertinentes.",
              "— Propose un avantage honnête aux premiers clients (frais de port offerts, échange facilité).",
              "— Note chaque objection entendue : elle devient une réponse sur la fiche produit.",
            ],
          },
        ],
      },
    ],
  },
];
