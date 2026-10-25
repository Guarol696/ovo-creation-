import type { Course } from "@/types/academy";

/** Formations « lancer et développer » : IA, entrepreneuriat, marketing, freelancing. Contenus de démonstration. */
export const growCourses: Course[] = [
  {
    slug: "ia-copilote",
    title: "L'IA comme copilote de projet",
    tagline: "Utiliser les assistants IA pour apprendre, écrire et décider plus vite.",
    description:
      "Les assistants IA accélèrent la recherche, l'écriture et la structuration d'un projet, à condition de savoir les guider et de vérifier ce qu'ils produisent. Formation pratique, sans jargon.",
    category: "intelligence-artificielle",
    level: "debutant",
    access: "free",
    objectives: [
      "Rédiger des demandes précises avec contexte, contraintes et format",
      "Utiliser l'IA pour explorer une idée sans lui déléguer le jugement",
      "Vérifier les affirmations et repérer les erreurs plausibles",
      "Construire une bibliothèque de demandes réutilisables",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-22",
    modules: [
      {
        slug: "bien-demander",
        title: "Bien demander",
        lessons: [
          {
            slug: "contexte-contraintes",
            title: "Contexte, contraintes, format",
            minutes: 10,
            summary: "Les trois ingrédients d'une demande efficace.",
            video: "dream",
            body: [
              "Un assistant ne connaît ni ton projet, ni ton public, ni tes contraintes. Donne-lui le contexte comme à un collègue compétent qui arrive aujourd'hui.",
              "— Contexte : qui tu es, pour qui tu travailles, ce qui existe déjà.",
              "— Contraintes : budget, délai, ton, ce qu'il faut éviter.",
              "— Format : liste, tableau, plan en étapes, nombre de propositions.",
              "Exemple : « Je lance un service de repas pour sportifs à Nantes. Propose 5 noms courts, prononçables en français, sans le mot \"fit\", sous forme de tableau avec l'intention de chaque nom. »",
            ],
          },
          {
            slug: "verifier",
            title: "Vérifier ce que l'IA affirme",
            minutes: 9,
            summary: "Les erreurs d'un assistant sont plausibles : voici comment les attraper.",
            body: [
              "Un assistant peut produire des chiffres, des citations ou des références qui semblent exactes et ne le sont pas. Toute donnée qui servira à décider doit être vérifiée à la source.",
              "— Demande d'où vient une information, puis consulte la source toi-même.",
              "— Méfie-toi des chiffres très précis sans origine.",
              "— Pour le juridique, le fiscal ou la santé, l'IA prépare tes questions ; un professionnel y répond.",
            ],
          },
        ],
      },
      {
        slug: "workflows",
        title: "Workflows",
        lessons: [
          {
            slug: "bibliotheque",
            title: "Ta bibliothèque de demandes",
            minutes: 8,
            summary: "Transformer les demandes qui marchent en outils réutilisables.",
            body: [
              "Chaque fois qu'une demande donne un bon résultat, enregistre-la avec des emplacements à remplir : [public], [offre], [ton].",
              "Classe-les par usage : recherche, écriture, relecture, plan d'action. En quelques semaines, tu disposes d'une boîte à outils adaptée à ta façon de travailler.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "assistant-ia-activite",
    title: "Construire un assistant IA pour son activité",
    tagline: "Intégrer un modèle de langage dans un produit, proprement et en sécurité.",
    description:
      "Formation avancée pour intégrer un modèle de langage dans un site ou une application : architecture serveur, protection des clés, coûts, évaluation de la qualité des réponses.",
    category: "intelligence-artificielle",
    level: "avance",
    access: "premium",
    objectives: [
      "Concevoir une architecture où la clé d'API reste côté serveur",
      "Écrire des instructions système stables et testables",
      "Maîtriser les coûts et limiter les abus",
      "Évaluer la qualité des réponses sur un jeu de cas réels",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-21",
    modules: [
      {
        slug: "architecture",
        title: "Architecture",
        lessons: [
          {
            slug: "cle-serveur",
            title: "La clé reste sur le serveur",
            minutes: 12,
            summary: "Pourquoi et comment ne jamais exposer une clé d'API au navigateur.",
            video: "steel",
            body: [
              "Tout ce qui est envoyé au navigateur peut être lu par n'importe qui. Une clé d'API placée dans le code client sera trouvée et utilisée à tes frais.",
              "Le navigateur appelle ta propre route serveur ; c'est elle qui vérifie l'utilisateur, applique des limites, puis appelle le fournisseur d'IA avec la clé stockée en variable d'environnement.",
              "— Authentifie chaque requête.",
              "— Limite le nombre de messages par utilisateur et par période.",
              "— Journalise les erreurs, pas le contenu sensible.",
            ],
          },
        ],
      },
      {
        slug: "qualite",
        title: "Qualité et coûts",
        lessons: [
          {
            slug: "evaluer",
            title: "Évaluer les réponses",
            minutes: 14,
            summary: "Un jeu de cas réels pour mesurer avant/après chaque changement.",
            body: [
              "Rassemble 30 à 50 questions réelles de tes utilisateurs, avec pour chacune ce qu'une bonne réponse doit contenir ou éviter.",
              "Avant chaque modification des instructions ou du modèle, rejoue ce jeu de cas et compare. Sans cette mesure, on améliore un cas en en cassant trois autres.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "proposition-de-valeur",
    title: "Définir sa proposition de valeur",
    tagline: "Pour qui, quel problème, quel résultat, pourquoi toi.",
    description:
      "Une proposition de valeur claire rend tout le reste plus simple : le site, la prospection, le prix. Méthode pas à pas, entretiens clients inclus.",
    category: "entrepreneuriat",
    level: "debutant",
    access: "free",
    objectives: [
      "Choisir un client cible précis plutôt que « tout le monde »",
      "Mener cinq entretiens de découverte sans orienter les réponses",
      "Formuler une proposition de valeur en une phrase",
      "La tester sur une page simple avant d'investir",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-19",
    modules: [
      {
        slug: "client",
        title: "Le client",
        lessons: [
          {
            slug: "client-cible",
            title: "Choisir un client cible",
            minutes: 10,
            summary: "Plus le client est précis, plus le message porte.",
            video: "sintel",
            body: [
              "« Les entrepreneurs » n'est pas un client cible. « Les kinésithérapeutes qui s'installent en libéral et n'ont pas encore de site » en est un.",
              "Un client précis te permet de savoir où le trouver, quels mots il utilise et ce qu'il a déjà essayé. Tu pourras élargir ensuite.",
              "Exercice : écris trois versions de ton client cible, de la plus large à la plus précise, et garde la plus précise.",
            ],
          },
          {
            slug: "entretiens",
            title: "Mener des entretiens de découverte",
            minutes: 13,
            summary: "Faire parler du passé, pas des intentions.",
            body: [
              "Ne demande jamais « Est-ce que tu achèterais… ? » : les gens sont polis et répondent oui. Demande « Raconte-moi la dernière fois que tu as dû… ».",
              "— Qu'as-tu essayé ? Combien cela t'a-t-il coûté ?",
              "— Qu'est-ce qui était le plus pénible ?",
              "— As-tu cherché une solution ? Laquelle ?",
              "Note les mots exacts : ils deviendront le texte de ta page.",
            ],
          },
        ],
      },
      {
        slug: "formuler",
        title: "Formuler",
        lessons: [
          {
            slug: "une-phrase",
            title: "La proposition en une phrase",
            minutes: 9,
            summary: "Un format simple, puis des itérations.",
            body: [
              "Format de départ : « J'aide [client] à [résultat] grâce à [mécanisme], sans [douleur habituelle] ».",
              "Teste la phrase à voix haute auprès de personnes du public visé. Si elles demandent « c'est-à-dire ? », elle n'est pas encore claire.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "produit-numerique",
    title: "Lancer un produit numérique",
    tagline: "Guide, modèle, mini-formation : créer, tarifer et lancer un produit qui se vend en ligne.",
    description:
      "Un produit numérique se crée une fois et se vend sans stock. Encore faut-il qu'il résolve un problème précis et qu'un public l'attende. Formation avancée : validation par pré-vente, création, lancement.",
    category: "entrepreneuriat",
    level: "avance",
    access: "premium",
    objectives: [
      "Choisir un format de produit adapté au problème",
      "Valider la demande par une pré-vente ou une liste d'attente",
      "Fixer un prix cohérent avec la valeur produite",
      "Organiser un lancement en trois temps",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-16",
    modules: [
      {
        slug: "valider",
        title: "Valider",
        lessons: [
          {
            slug: "pre-vente",
            title: "Valider par la pré-vente",
            minutes: 12,
            summary: "Faire payer avant de produire, honnêtement.",
            video: "bunny",
            body: [
              "La pré-vente consiste à vendre un produit annoncé avec une date de livraison et une promesse de remboursement si le produit n'est pas livré.",
              "Fixe à l'avance un seuil de décision : par exemple, 20 pré-ventes en deux semaines. En dessous, tu rembourses et tu as économisé des semaines de travail.",
            ],
          },
        ],
      },
      {
        slug: "lancer",
        title: "Lancer",
        lessons: [
          {
            slug: "trois-temps",
            title: "Le lancement en trois temps",
            minutes: 11,
            summary: "Annonce, ouverture, clôture.",
            body: [
              "— Annonce : explique le problème et ce que tu prépares, invite à rejoindre une liste.",
              "— Ouverture : ouvre les ventes à la liste en premier, avec un avantage réel et limité.",
              "— Clôture : rappelle la date de fin, réponds aux questions publiquement.",
              "Après le lancement, interroge les acheteurs et ceux qui n'ont pas acheté : leurs réponses préparent la version suivante.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "acquisition-90-jours",
    title: "Stratégie d'acquisition : les 90 premiers jours",
    tagline: "Choisir ses canaux, produire régulièrement, mesurer ce qui ramène des clients.",
    description:
      "Plutôt que d'être partout, choisir deux canaux adaptés à son client et les travailler sérieusement pendant 90 jours. Plan hebdomadaire et tableau de bord inclus.",
    category: "marketing",
    level: "intermediaire",
    access: "pro",
    objectives: [
      "Choisir deux canaux à partir du comportement du client",
      "Construire un rythme de publication tenable",
      "Suivre un tableau de bord de 5 indicateurs maximum",
      "Décider à 30, 60 et 90 jours : continuer, ajuster ou arrêter",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-14",
    modules: [
      {
        slug: "canaux",
        title: "Canaux",
        lessons: [
          {
            slug: "choisir-canaux",
            title: "Choisir deux canaux",
            minutes: 11,
            summary: "Là où ton client cherche déjà une solution.",
            video: "dream",
            body: [
              "Deux familles de canaux : ceux où le client cherche activement (moteurs de recherche, places de marché, annuaires) et ceux où il découvre (réseaux sociaux, communautés, partenariats).",
              "Commence par un canal de chaque famille. Un service local privilégiera la recherche locale et les partenariats ; un produit visuel, une plateforme d'images et une newsletter.",
            ],
          },
        ],
      },
      {
        slug: "mesurer",
        title: "Mesurer",
        lessons: [
          {
            slug: "tableau-de-bord",
            title: "Un tableau de bord en 5 lignes",
            minutes: 10,
            summary: "Visites, prospects, conversations, clients, coût.",
            body: [
              "— Visites qualifiées par canal.",
              "— Prospects (emails, demandes de devis).",
              "— Conversations commerciales.",
              "— Clients signés.",
              "— Coût (temps et argent) par client.",
              "Mets-le à jour chaque vendredi. La régularité de la mesure compte plus que sa sophistication.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "premiers-clients",
    title: "Trouver ses premiers clients en freelance",
    tagline: "Positionnement, prospection directe, devis : signer les trois premières missions.",
    description:
      "Les premiers clients viennent rarement d'une plateforme ou d'un site. Ils viennent d'un positionnement clair et d'une prospection directe, respectueuse et régulière.",
    category: "freelancing",
    level: "debutant",
    access: "free",
    objectives: [
      "Formuler un positionnement compréhensible en une phrase",
      "Construire une liste de 50 prospects pertinents",
      "Écrire un message de prospection personnalisé",
      "Rédiger un devis clair, avec périmètre et conditions",
    ],
    instructor: { name: "Équipe pédagogique EMPIRE", role: "Contenu de démonstration" },
    status: "demo",
    updatedAt: "2026-10-17",
    modules: [
      {
        slug: "prospecter",
        title: "Prospecter",
        lessons: [
          {
            slug: "liste-prospects",
            title: "Construire sa liste de prospects",
            minutes: 10,
            summary: "Cinquante noms, choisis, pas aspirés.",
            video: "sintel",
            body: [
              "Ta liste commence par ton réseau : anciens collègues, clients d'un ancien employeur, commerçants que tu connais. Puis les entreprises qui ont visiblement le problème que tu résous.",
              "Pour chaque prospect, note une observation précise (site lent, pas de prise de rendez-vous en ligne, absence sur un canal clé). C'est elle qui rendra ton message personnel.",
            ],
          },
          {
            slug: "message",
            title: "Le message de prospection",
            minutes: 9,
            summary: "Court, personnel, une seule question.",
            body: [
              "Structure : une observation précise sur leur activité, une phrase sur ce que tu fais pour des entreprises similaires, une question simple (« Est-ce un sujet pour vous en ce moment ? »).",
              "Pas de pièce jointe, pas de tarif, pas de lien vers un portfolio de vingt projets. L'objectif est une réponse, pas une vente.",
              "Relance une seule fois, une semaine plus tard, puis passe au suivant.",
            ],
          },
        ],
      },
      {
        slug: "signer",
        title: "Signer",
        lessons: [
          {
            slug: "devis",
            title: "Un devis clair",
            minutes: 11,
            summary: "Périmètre, livrables, calendrier, conditions de paiement.",
            body: [
              "Un bon devis protège les deux parties. Il décrit ce qui est inclus, mais aussi ce qui ne l'est pas, et ce qui se passe en cas de demande supplémentaire.",
              "— Livrables précis et nombre d'allers-retours.",
              "— Calendrier avec les dépendances (contenus fournis par le client).",
              "— Acompte à la signature et échéances.",
              "Vérifie les mentions obligatoires applicables à ton statut auprès des sources officielles.",
            ],
          },
        ],
      },
    ],
  },
];
