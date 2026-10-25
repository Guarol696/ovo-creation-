# EMPIRE — académie entrepreneuriale « Dark Future Luxury »

> Nom de travail : modifiable via `NEXT_PUBLIC_BRAND_NAME` ou `src/config/site.ts`.

Plateforme pour apprendre à entreprendre : formations, parcours, lecteur de cours, tableau de bord,
projets personnels, abonnements et assistant IA — avec une signature visuelle immersive (scène 3D
procédurale, typographie architecturale, transitions signature).

Projet **autonome** dans le dossier `empire/` (il n'utilise ni ne modifie l'application OVO à la racine du dépôt).

## Démarrer

```bash
cd empire
npm install
cp .env.example .env.local   # facultatif : sans variable, mode démonstration
npm run dev                  # http://localhost:3000
```

| Script              | Rôle                                   |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Serveur de développement               |
| `npm run build`     | Build de production                    |
| `npm run start`     | Sert le build                          |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | Types de routes + `tsc`                |
| `npm test`          | Tests unitaires (Vitest)               |
| `npm run check`     | Lint + types + tests + build           |

Déploiement Vercel : nouveau projet sur ce dépôt avec **Root Directory = `empire`**.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · three.js (scène procédurale,
sans modèle externe) · Supabase (auth, Postgres, RLS) · Stripe (Checkout, portail, webhook) ·
SDK Anthropic (assistant) · zod · lucide-react.
Pas de GSAP ni Framer Motion : CSS (transform/opacity/clip-path) + Web Animations API suffisent et évitent
les conflits entre moteurs d'animation.

## Architecture

```
src/
├── app/                    # Routes : accueil, academy, learn, dashboard, pricing, auth, settings, paths, pillars, assistant…
│   └── api/                # assistant (streaming), stripe/webhook
├── components/
│   ├── motion/             # Système de mouvement réutilisable (voir plus bas)
│   ├── three/              # Scène 3D (module impératif + conteneur React)
│   ├── art/                # Compositions SVG : glyphes de catégories, piliers, plans de projets
│   ├── layout/ ui/ sections/
├── config/                 # site, motion (durées/courbes), plans (tarifs), media (vidéos)
├── data/                   # Catalogue de démonstration (formations, parcours, piliers, projets)
├── features/               # academy, player, progress, dashboard, projects, auth, billing, assistant, settings, home
├── lib/                    # env, supabase (clients, proxy), auth (session, redirections)
└── types/
supabase/migrations/        # Schéma + politiques RLS
```

## Direction artistique & mouvement

- **Palette** : noir `#050505`/`#0A0A0C`, graphite `#171719`, argent `#C6C6CC`, blanc `#F5F5F7`, accent « volt » `#D8FF3D`
  réservé aux signaux (focus, progression, état actif).
- **Typographie** : Archivo étendu (titres architecturaux), Geist (texte), Geist Mono (métadonnées).
- **Tokens de mouvement** : `src/config/motion.ts` ↔ variables CSS de `globals.css` (synchronisation testée).

| Effet | Où | Implémentation |
| --- | --- | --- |
| Opening 3D | Accueil | `three/monolith-scene.ts` : lumière qui révèle la géométrie, caméra qui plonge dans l'anneau au défilement, qualité adaptative, rendu suspendu hors écran, repli SVG |
| Portal transition | Navigation principale, CTA | `motion/transition-provider.tsx` : disque qui s'ouvre depuis le clic + libellé, révélation par « trou » central |
| Infinite zoom | Catégories, cartes de formation | Le glyphe cliqué s'agrandit jusqu'à couvrir l'écran ; la page suivante arrive en continuité |
| Cinematic typography | Partout | `RevealLines` (masque ligne par ligne), `RevealWords` (un nœud par mot), hero en CSS pur |
| Section transformation | Philosophy, piliers | `ScrollScene` expose `--p` (0→1) ; transformations décrites en CSS |
| Depth / parallaxe | Philosophy, piliers, hero | Couches à vitesses différentes, `PointerDepth` |
| Magnetic | Boutons majeurs | `Magnetic` : le contenu se déplace, pas la zone cliquable |
| Curseur | Desktop | `Cursor` : point + anneau, indications `data-cursor-label` |

Navigation : liens Next.js normaux (URL, retour/suivant, rechargement, Ctrl/Cmd+clic intacts). Mouvement
réduit (système **ou** réglage dans /settings) : transitions remplacées par des changements immédiats.

## Fonctionnalités réellement opérationnelles

- Catalogue : recherche (sans accents), filtres domaine/niveau/accès, tri, état dans l'URL, chargement et état vide.
- Détail de formation, programme, règles d'accès vérifiées côté serveur (1re leçon offerte, puis offre requise).
- Lecteur : vidéo (reprise de position, erreur + réessai), contenu écrit, leçon terminée, notes auto-enregistrées, progression.
- Tableau de bord : en cours, terminées, reprise, accès rapides, recommandations, projets personnels (CRUD).
- Parcours avec étapes, ressources publiques et avancement.
- Réglages : profil, animations, curseur, taille du texte, contraste, abonnement, déconnexion (appareil / tous).

**Mode démonstration** (sans Supabase) : progression, notes et projets dans le navigateur, signalés comme tels.

## Intégrations à configurer

### Supabase
1. Créer un projet, exécuter `supabase/migrations/20261025120000_empire_schema.sql` (SQL Editor).
2. Renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Auth → URL Configuration : ajouter `https://<domaine>/auth/confirm` aux Redirect URLs.

Dès que Supabase est configuré, `/dashboard` et `/settings` exigent une connexion (proxy + vérification dans la page).

### Stripe
1. Créer deux prix récurrents (Pro, Premium) et reporter leurs identifiants dans `STRIPE_PRICE_PRO` / `STRIPE_PRICE_PREMIUM`
   (et les montants affichés dans `src/config/plans.ts`).
2. `STRIPE_SECRET_KEY`, puis un webhook vers `https://<domaine>/api/stripe/webhook` avec les événements
   `checkout.session.completed`, `customer.subscription.created|updated|deleted|paused|resumed` → `STRIPE_WEBHOOK_SECRET`.
3. Activer le portail client Stripe (gestion/résiliation).

L'offre n'est écrite que par le webhook signé, après relecture de l'abonnement chez Stripe ; la page de succès n'accorde rien.
Un abonnement inactif ramène à l'offre gratuite (accès révoqué).

### Assistant IA
`ANTHROPIC_API_KEY` côté serveur (optionnel : `ASSISTANT_MODEL`). La route `/api/assistant` valide, authentifie
(si comptes actifs) et limite le débit (en mémoire : à remplacer par un stockage partagé en multi-instances).
Sans clé : page de prévisualisation explicite, aucune réponse simulée.

## Contenus

Les 10 formations, 5 parcours et exemples de projets sont des **contenus de démonstration**, signalés dans l'interface.
Les vidéos sont des films libres de la Blender Foundation (CC BY), sans rapport avec les leçons, pour tester le lecteur.
Aucun avis, témoignage, chiffre d'utilisateurs ou logo partenaire n'est inventé. Les pages légales sont des modèles à valider.

## Prochaines étapes conseillées

1. Brancher le catalogue sur les tables `courses` / `lessons` (et un stockage vidéo) au lieu de `src/data`.
2. Rédiger et filmer les vraies formations ; profils formateurs réels.
3. Limiteur de débit partagé (Redis/Upstash) pour l'assistant ; historique de conversations.
4. Achats de formations à l'unité (table `purchases` prévue) ; essais gratuits Stripe.
5. Mesures de performance réelles (Lighthouse/WebPageTest sur mobile milieu de gamme) et tests end-to-end Playwright.
