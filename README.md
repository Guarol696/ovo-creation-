# OVO — « Où On Va ? »

Plateforme de voyage pour les 18–30 ans : l'utilisateur indique ses envies, son budget, ses dates,
le nombre de voyageurs et son style, et OVO lui propose un voyage personnalisé.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (design tokens dans `src/app/globals.css`)
- Supabase (base de données + authentification, via `@supabase/ssr`)
- Leaflet (carte interactive, chargé uniquement côté navigateur ; fond de carte OpenStreetMap/CARTO)
- pdf-lib (export PDF généré côté serveur, sans navigateur headless)
- Déploiement prévu sur Vercel

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

| Script              | Rôle                                  |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Serveur de développement              |
| `npm run build`     | Build de production                   |
| `npm run start`     | Sert le build de production           |
| `npm run lint`      | ESLint                                |
| `npm run typecheck` | Génère les types de routes + `tsc`    |
| `npm run format`    | Prettier (+ tri des classes Tailwind) |
| `npm test`          | Tests unitaires (Vitest)              |

## Architecture

```
src/
├── app/                      # Routes (App Router)
│   ├── (marketing)/          # Pages publiques : landing, à propos, légal…
│   ├── (auth)/connexion/     # Authentification (à venir)
│   ├── (app)/voyage/nouveau/ # Produit : questionnaire, résultats… (à venir)
│   ├── layout.tsx            # Layout racine (polices, métadonnées)
│   ├── globals.css           # Thème Tailwind : couleurs, typos, animations
│   ├── robots.ts / sitemap.ts / icon.svg / not-found.tsx
├── components/
│   ├── ui/                   # Briques génériques (Button, Badge, Container, Reveal…)
│   ├── layout/               # Header, menu mobile, footer, logo
│   ├── sections/             # Blocs de page réutilisables (PageIntro, ComingSoon)
│   └── icons/                # Icônes de marques (Instagram, TikTok)
├── features/
│   ├── landing/              # Sections de la landing page
│   └── trip-builder/         # Questionnaire « Créer mon voyage »
│       ├── steps.ts          # Définition et ordre des étapes
│       ├── validation.ts     # Validation de chaque étape (messages FR)
│       ├── schema.ts         # Schéma zod de la demande finale (côté serveur)
│       ├── to-trip-request.ts# Brouillon → TripRequest structuré
│       ├── draft-storage.ts  # Sauvegarde locale du questionnaire en cours
│       ├── actions.ts        # Server Action : validation + sauvegarde optionnelle
│   │   └── components/       # Orchestrateur, étapes, récap, écran de transition
│   ├── trip-engine/          # Moteur de génération (serveur uniquement)
│   │   ├── data-source/      # Contrat TravelDataSource + catalogue de démo + profil générique
│   │   ├── preferences.ts    # Réponses → préférences pondérées
│   │   ├── scoring.ts        # Score de compatibilité des destinations (interne)
│   │   ├── budget.ts         # Estimation par catégorie + niveau de confort
│   │   ├── itinerary.ts      # Programme jour par jour
│   │   ├── logistics.ts      # Choix du quartier où loger
│   │   ├── locations.ts      # Lieux de la carte, horaires indicatifs, trajets estimés
│   │   ├── services/         # Transport, hébergement, activités, restaurants (démo → API)
│   │   ├── explain.ts        # « Pourquoi OVO… », alertes, moments forts
│   │   └── generate-travel-plan.ts  # Orchestrateur du pipeline
│   └── trip-results/         # Page de résultats (sections, carte + programme, budget, sauvegarde)
├── config/                   # Config du site (nav, routes, images, réseaux sociaux)
├── data/                     # Données statiques de démonstration
├── lib/
│   ├── trip/                 # Domaine voyage : options, budget, mise en forme
│   ├── dates.ts              # Dates calendaires ISO (sans fuseau horaire)
│   ├── env.ts                # Accès typé aux variables d'environnement
│   ├── supabase/             # Clients Supabase (navigateur / serveur)
│   └── utils.ts
└── types/                    # Types métier (voyage, destination…)
```

### Principes

- **Une fonctionnalité = un dossier** dans `src/features/` (ex. futurs `trip-builder/`, `trip-results/`,
  `account/`, `premium/`).
- **Intégrations externes** (vols, hôtels, activités, cartes, IA, paiements) : à placer dans
  `src/services/<fournisseur>/`, appelées uniquement côté serveur (Server Actions / Route Handlers)
  pour ne jamais exposer de clé secrète.
- **Secrets** : uniquement dans `.env.local` / variables Vercel. Seules les variables préfixées
  `NEXT_PUBLIC_` sont exposées au navigateur.
- **Images** : centralisées dans `src/config/images.ts` ; les domaines distants sont autorisés dans
  `next.config.ts`. Chaque image a un dégradé de secours si elle ne charge pas.

## Moteur de génération

```
Questionnaire → validation (zod, serveur) → analyse des préférences
  → destination (choisie, ou recommandée par score) → niveau de confort selon le budget
  → programme jour par jour → budget détaillé → explications & moments forts → TravelPlan
```

- **Déterministe** : mêmes réponses = même voyage. Les réponses sont encodées dans l'URL
  (`/voyage/resultat?v=…`), ce qui rend le résultat rechargeable et partageable sans base de données.
- **Données de démonstration** : `src/features/trip-engine/data-source/demo/` (10 destinations).
  Aucun prix n'est réel ; l'interface le rappelle systématiquement.
- **Services transport & hébergement** (`trip-engine/services/`) : chaque service expose une
  interface de fournisseur (`TransportProvider`, `AccommodationProvider`) et une implémentation de
  démonstration. Pour brancher une vraie API, il suffit d'implémenter l'interface et de la passer à
  `generateTravelPlan(request, { transportProvider, accommodationProvider })`.
- **Activités & restaurants** : les services `activities` et `restaurants` classent le catalogue selon
  le profil (règles simples). Le programme pioche uniquement dans ces listes, et chaque élément sait
  où il est programmé (`schedule`). Restaurants et notes sont fictifs (noms « OVO »).
- **Budget** : nourriture = repas réellement programmés + petits-déjeuners/en-cas ; activités =
  activités programmées. Les postes transport et hébergement reprennent exactement les options affichées
  (mêmes montants que les cartes). Établissements, notes et prix sont fictifs et signalés comme tels.
- **Carte & itinéraire** : `TravelPlan → itinéraire → lieux (TripMap.locations) → marqueurs`.
  `locations.ts` construit les lieux (hébergement, activités, restaurants, points d'intérêt) à partir
  du programme et des coordonnées de démonstration (`data-source/demo/geo.ts`), puis ajoute à chaque
  étape un horaire indicatif, son lieu (`locationId`) et un trajet estimé depuis l'étape précédente
  (distance à vol d'oiseau, temps approximatif — aucun calcul d'itinéraire réel). Une destination
  sans coordonnées affiche le programme sans carte. Côté interface, `DayExplorer` synchronise jours,
  étapes, filtres et carte ; `TravelMap` (Leaflet) crée les marqueurs une seule fois par voyage.
  Le fond de carte se configure via `NEXT_PUBLIC_MAP_TILES_URL` / `NEXT_PUBLIC_MAP_ATTRIBUTION`
  (voir `.env.example`) ; en production, prévoir un fournisseur de tuiles adapté au trafic.
- **Remplaçable** : le moteur ne dépend que de l'interface `TravelDataSource`
  (`generateTravelPlan(request, { dataSource })`). Chaque bloc du `TravelPlan` porte sa `source`
  (`demo`, `generic`, `api`) pour brancher progressivement vols, hôtels, activités ou une IA.

## Comptes & voyages enregistrés (Supabase)

OVO fonctionne **sans compte** : accueil → questionnaire → génération → résultat. Le compte ne sert
qu'à enregistrer ses voyages (« 💾 Enregistrer mon voyage »), à les retrouver dans « Mes voyages » et
à les supprimer. Sans variables Supabase, le site marche comme avant et les pages de compte
affichent « Les comptes arrivent très bientôt ».

```
src/proxy.ts                      # Rafraîchit la session, protège /mes-voyages et /compte
src/app/auth/confirm/route.ts     # Retour des liens email (confirmation, mot de passe oublié)
src/features/auth/                # Actions serveur (inscription, connexion…), formulaires, état de session
src/features/saved-trips/         # Enregistrer / lister / ouvrir / supprimer un voyage
supabase/migrations/              # Tables, triggers et règles RLS
```

**Base de données** (`supabase/migrations/`)

- `profiles` : prénom / pseudo, créé automatiquement à l'inscription (trigger sur `auth.users`).
- `saved_trips` : voyages enregistrés (reprend la table `trip_requests` de l'étape 2, renommée).
  Colonnes d'affichage (`title`, `destination`, `country`, `start_date`, `end_date`, `duration`,
  `travelers`, `budget`), la demande (`request`, JSONB), son empreinte (`request_hash`, un voyage
  n'est enregistré qu'une fois) et le `travel_plan` complet (JSONB), réaffiché tel quel sans
  nouvelle génération.
- **RLS** : chaque utilisateur ne peut lire, créer, modifier et supprimer que ses propres lignes ;
  les visiteurs non connectés n'ont aucun accès. Le serveur recalcule lui-même le plan à enregistrer
  (il ne fait jamais confiance à un plan envoyé par le navigateur) et revérifie l'utilisateur dans
  chaque page et chaque action.

**Mise en service**

1. Créer un projet Supabase, puis renseigner dans `.env.local` (et sur Vercel) :
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `NEXT_PUBLIC_SITE_URL` (URL publique
   du site, utilisée dans les liens des emails). Aucune clé secrète n'est nécessaire.
2. Appliquer les migrations : `supabase db push` (CLI) ou copier les fichiers SQL, dans l'ordre, dans
   l'éditeur SQL du tableau de bord.
3. Authentication → URL Configuration : **Site URL** = l'URL du site ; **Redirect URLs** =
   `https://<domaine>/auth/confirm` (et `http://localhost:3000/auth/confirm` en développement).
4. Authentication → Providers → Email : garder « Confirm email » activé (recommandé) ; longueur
   minimale du mot de passe : 8. Les modèles d'email par défaut conviennent (flux PKCE).
5. En production : configurer un SMTP (Authentication → SMTP Settings). Le service d'email intégré
   de Supabase est limité à quelques emails par heure, réservé aux tests.

## Partage & export PDF

**Partager** (« Partager mon voyage ») : partage natif du téléphone (Web Share API) quand il existe,
sinon « Copier le lien » → « Lien copié ✓ ».

- Voyage tout juste généré : on partage le lien de la page de résultat.
- Voyage enregistré : **privé par défaut**. Son propriétaire le rend partageable ; un jeton secret
  aléatoire est créé et le lien public est `/voyage/partage/<jeton>` (l'identifiant du voyage n'est
  jamais exposé). « Désactiver le partage » efface le jeton : l'ancien lien affiche « Ce voyage n'est
  plus partagé » (404). Réactiver crée un nouveau lien.
- Vue publique : le voyage seul (destination, dates, voyageurs, budget, transport, hébergement,
  programme, carte, activités, restaurants), sans aucune information du compte ni action du
  propriétaire, non indexée. Le texte libre « envie particulière » n'est jamais stocké dans le plan
  ni affiché publiquement.
- Sécurité (migration `20260924090000_share_saved_trips.sql`, sans contourner la RLS) : le rôle `anon`
  ne peut lire que les colonnes publiques, et une politique RLS n'autorise la lecture que d'un voyage
  partagé dont le jeton est présenté dans l'en-tête `x-ovo-share-token` : impossible de lister les
  voyages partagés ou de deviner un lien.

**Télécharger** (« Télécharger mon voyage ») : PDF A4 généré côté serveur (`src/features/trip-export/`,
pdf-lib, polices standard) : couverture, résumé et points forts, transport, hébergement, programme
jour par jour (matin, midi, après-midi, soir), activités, restaurants, budget détaillé ; en-tête,
pagination « Page n / N » et date de génération. Nom du fichier :
`ovo-voyage-<destination>-<date de départ ou mois>.pdf`. Routes : `/voyage/resultat/pdf?v=…`,
`/mes-voyages/<id>/pdf` (propriétaire) et `/voyage/partage/<jeton>/pdf` (lien public actif).

## Feuille de route

- [x] Étape 1 — Fondations + landing page
- [x] Étape 2 — Questionnaire « Créer mon voyage » (`/voyage/nouveau`)
- [x] Étape 3 — Moteur de génération (démo) & page de résultats (`/voyage/resultat`)
- [x] Étape 4 — Transport (« Comment y aller ? ») & hébergement (« Où dormir ? ») intégrés au budget
- [x] Étape 5 — Activités (« Que faire ? ») & restaurants (« Où manger ? ») avec filtres, intégrés au programme et au budget
- [x] Étape 6 — Carte interactive (« Ton voyage sur la carte ») & itinéraire jour par jour synchronisé
- [x] Étape 7 — Comptes (Supabase Auth), sauvegarde des voyages, « Mes voyages », suppression, RLS
- [x] Étape 8 — Partage d'un voyage (lien public contrôlé) et export PDF
- [ ] OVO Premium & paiements
