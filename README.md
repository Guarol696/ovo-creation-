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

> Guide pas à pas (installation, Supabase, Stripe, dépannage) : **[DEMARRAGE.md](DEMARRAGE.md)**.

```bash
npm install
npm run setup    # crée .env.local à partir de .env.example
npm run dev      # http://localhost:3000 — fonctionne sans aucune clé
npm run doctor   # vérifie la configuration Supabase / Stripe
```

| Script              | Rôle                                  |
| ------------------- | ------------------------------------- |
| `npm run setup`     | Crée `.env.local`, vérifie Node.js    |
| `npm run doctor`    | Diagnostic Supabase / Stripe          |
| `npm run check`     | Lint + types + tests + build          |
| `npm run db:bundle` | Régénère `supabase/setup.sql`         |
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
   du site, utilisée dans les liens des emails). Pour les abonnements, ajouter aussi la clé secrète
   `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement).
2. Créer les tables : coller `supabase/setup.sql` (toutes les migrations regroupées) dans l'éditeur SQL
   du tableau de bord, ou `supabase db push` avec la CLI.
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

## Offres & abonnements (Stripe)

Trois offres : **OVO Gratuit**, **OVO Medium** (5,99 €/mois) et **OVO Premium** (9,99 €/mois).
Premium inclut tout Medium, et Medium inclut tout le gratuit. Aucune fonctionnalité gratuite n'a été retirée.

| Offre   | Ajoute                                                                                   |
| ------- | ---------------------------------------------------------------------------------------- |
| Gratuit | Création, programme, carte, budget, 20 voyages enregistrés, partage par lien, export PDF |
| Medium  | Carnet de voyage PDF (alternatives, checklist de départ, notes), 60 voyages enregistrés  |
| Premium | Liens de partage à durée limitée (7 j / 30 j / sans limite), 200 voyages enregistrés     |

- **Configuration unique** : `src/config/premium.ts` règle les noms, les prix annoncés (`PLANS`), les fonctionnalités et l'offre minimum de chacune (`FEATURES`), ainsi que les limites (`PLAN_LIMITS`).
  - **Stripe fait foi** pour le montant, la devise, la période et le Price ID. Les identifiants sont lus dans `STRIPE_MEDIUM_PRICE_ID` et `STRIPE_PREMIUM_PRICE_ID`, côté serveur. Le navigateur n'envoie que `medium` ou `premium`.
  - `/premium` et « Mon offre » affichent le prix lu sur le Price Stripe (`server/prices.ts`, cache de 5 min). Si Stripe est injoignable, ils reprennent la valeur de la configuration.
  - Chaque Price est comparé à la configuration (`price-check.ts`). Un écart (par exemple 5,99 € annoncé contre 6,99 € chez Stripe) est journalisé et affiché en encadré rouge sur `/premium`, en développement et en mode test.
  - Un Price archivé ou non récurrent bloque le Checkout, avec un message clair.
- **Base** : la table `subscriptions` compte une ligne par utilisateur. La migration `20260926090000_stripe_billing.sql` ajoute les colonnes suivantes :
  - `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id` ;
  - `plan`, `subscription_status` ;
  - `current_period_start`, `current_period_end`, `cancel_at_period_end`.

  La RLS n'autorise que la lecture de sa propre ligne. Aucune écriture n'est possible depuis le navigateur. Seul le serveur écrit, avec la clé `service_role`, dans `src/lib/supabase/admin.ts`.

- **Paiement** (`src/features/billing`) :
  1. La Server Action `startCheckout` vérifie la session et choisit le Price ID côté serveur.
  2. Elle crée ou réutilise le Customer Stripe lié au compte (`metadata.ovo_user_id`).
  3. Elle redirige vers Stripe Checkout en mode abonnement.

  Un visiteur est envoyé vers la connexion. Les changements d'offre, l'annulation, la carte et les factures passent par le Customer Portal (`openBillingPortal`) :
  - « Passer à Premium » et « Passer à Medium » ouvrent directement la confirmation du changement (`subscription_update_confirm`), avec le Price choisi par le serveur ;
  - « Repasser en gratuit » ouvre l'annulation en fin de période (`subscription_cancel`) ;
  - si ces parcours ne sont pas activés dans le portail, le portail classique s'ouvre.

  Au retour (`/compte?retour=portail`), OVO relit l'état synchronisé. Rien ne change tant que Stripe n'a pas confirmé.

- **Synchronisation** : `POST /api/stripe/webhook` vérifie la signature, puis relit l'abonnement chez Stripe avant d'écrire.
  - Événements traités : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
  - **Idempotence** : chaque événement est enregistré dans `stripe_webhook_events` (migration `20260927090000_stripe_webhook_events.sql`), par la fonction atomique `claim_stripe_webhook_event`.
    - Un événement relivré et déjà traité est ignoré.
    - Un événement en cours de traitement reçoit 409, et Stripe relivrera.
    - Un échec renvoie 500, et l'événement sera retraité.
    - La table n'est accessible qu'au rôle service.
  - La page `/payment/success` n'active rien : « Paiement reçu 🎉 — Nous confirmons ton abonnement… », puis « Abonnement confirmé ✓ » quand le webhook a mis la base à jour (rafraîchissement toutes les 3 s).
    - Elle lit la session Checkout pour afficher « Paiement non finalisé » si la session n'a pas été payée.
    - Elle ne l'utilise jamais pour accorder des droits.
  - **Réconciliation** : `GET /api/stripe/reconcile`, protégée par `Authorization: Bearer CRON_SECRET`, est appelée chaque jour par Vercel Cron (`vercel.json`).
    - Elle relit chez Stripe l'abonnement de chaque compte lié à un client Stripe, pour rattraper un webhook perdu.
    - Un abonnement que Stripe ne connaît plus perd son accès.
    - Elle purge les événements traités de plus de 90 jours.
- **Droits** : ils sont décidés côté serveur par `getEntitlements()` et `canUseFeature()` (`src/features/premium/server`). Ces deux fonctions appliquent `hasFeatureAccess(droits, fonctionnalité)` (`src/features/premium/plan.ts`) à l'abonnement lu en base.
  - Les statuts `active`, `trialing` et `past_due` donnent accès à l'offre. `past_due` correspond à la période de relance, et l'utilisateur est prévenu.
  - Les autres statuts renvoient au gratuit.
  - `<PremiumFeature feature="…">` affiche la fonctionnalité ou une carte verrouillée. Les routes et les actions revérifient les droits.
  - `useAuth().plan` ne sert qu'à l'affichage.

### Configurer Stripe (mode test)

1. Dans le Dashboard, en **mode test**, créer deux produits avec un prix récurrent mensuel en EUR : « OVO Medium » à 5,99 € et « OVO Premium » à 9,99 €. Copier les deux `price_…`.
2. Dans **Developers → API keys**, copier `pk_test_…` et `sk_test_…`.
3. Dans **Developers → Webhooks**, ajouter l'endpoint `https://<domaine>/api/stripe/webhook` avec les six événements ci-dessus, puis copier le `whsec_…`.
4. Dans **Settings → Billing → Customer portal**, activer le portail :
   - changement d'offre entre les deux prix ;
   - annulation ;
   - moyen de paiement et factures.
5. Renseigner `.env.local`, ou les variables Vercel :
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ;
   - `STRIPE_SECRET_KEY` ;
   - `STRIPE_WEBHOOK_SECRET` ;
   - `STRIPE_MEDIUM_PRICE_ID` ;
   - `STRIPE_PREMIUM_PRICE_ID` ;
   - `SUPABASE_SERVICE_ROLE_KEY` ;
   - `CRON_SECRET` (au moins 16 caractères aléatoires, pour la réconciliation quotidienne) ;
   - facultatif : `STRIPE_PORTAL_CONFIGURATION_ID`.
6. Appliquer les migrations : `supabase db push`, ou exécuter les fichiers SQL dans l'ordre.
7. En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Utiliser le `whsec_` affiché par la commande.
8. Cartes de test :
   - `4242 4242 4242 4242` : paiement accepté ;
   - `4000 0000 0000 0002` : paiement refusé ;
   - pour simuler un renouvellement ou un échec de renouvellement, utiliser les **Test clocks** de Stripe.

Sans ces variables, le site fonctionne. Les boutons de paiement indiquent alors que le paiement n'est pas encore activé, et le webhook répond 503.

## Mobile & accessibilité

OVO est pensé d'abord pour le téléphone. Les pages sont vérifiées de 320 px à 1440 px.

- **Navigation mobile** (< 1024 px) :
  - une barre d'onglets en bas d'écran (`components/layout/mobile-tab-bar.tsx`) : Accueil, Créer, Voyages, Premium, Compte ou Connexion ;
  - le menu ☰ garde les liens secondaires.
- **Questionnaire** :
  - il vit dans le groupe de routes `(focus)` : ni pied de page ni barre d'onglets, pour que « Continuer » et « Générer mon voyage » restent collés en bas de l'écran ;
  - l'animation « OVO prépare ton voyage… » s'affiche pendant la génération ;
  - une erreur renvoie au récapitulatif avec un message.
- **Page du voyage** :
  - un sommaire des sections reste collé sous l'en-tête, avec la section en cours mise en évidence (`result-section-nav.tsx`) ;
  - sur mobile, l'itinéraire et la carte sont en onglets « Itinéraire / Carte » ;
  - « Voir sur la carte » bascule sur la carte et ouvre la fiche du lieu ;
  - la carte se recadre quand elle redevient visible ;
  - 4 restaurants sont affichés sur mobile, avec « Voir les N restaurants ».
- **Mes voyages** : chaque carte propose Voir, Partager (ouvre la fenêtre de partage via `#partager`) et Supprimer (avec confirmation).
- **Règles de mise en page** :
  - cibles tactiles d'au moins 44 px (marqueurs et zoom de la carte compris) ;
  - textes d'au moins 12 px (`text-xs`) ;
  - textes secondaires au moins en `text-night-100/60` (contraste AA) ;
  - `scroll-padding-bottom` pour qu'aucun élément amené à l'écran ne finisse sous la barre d'onglets ;
  - `viewport-fit=cover` et `env(safe-area-inset-*)` pour les iPhone à encoche.
- **Chargement** : pas de `loading.tsx` sur une route qui appelle `redirect()` ou `notFound()`. Le streaming transformerait une 404 ou une redirection en page 200.

## Feuille de route

- [x] Étape 1 — Fondations + landing page
- [x] Étape 2 — Questionnaire « Créer mon voyage » (`/voyage/nouveau`)
- [x] Étape 3 — Moteur de génération (démo) & page de résultats (`/voyage/resultat`)
- [x] Étape 4 — Transport (« Comment y aller ? ») & hébergement (« Où dormir ? ») intégrés au budget
- [x] Étape 5 — Activités (« Que faire ? ») & restaurants (« Où manger ? ») avec filtres, intégrés au programme et au budget
- [x] Étape 6 — Carte interactive (« Ton voyage sur la carte ») & itinéraire jour par jour synchronisé
- [x] Étape 7 — Comptes (Supabase Auth), sauvegarde des voyages, « Mes voyages », suppression, RLS
- [x] Étape 8 — Partage d'un voyage (lien public contrôlé) et export PDF
- [x] Étape 9 — OVO Premium : offre, page `/premium`, droits côté serveur, badge, carnet de voyage PDF (sans paiement)
- [x] Étape 10 — Abonnements Stripe (OVO Medium, OVO Premium) : Checkout, webhooks, Customer Portal, droits synchronisés
- [x] Étape 11 — Optimisation mobile & UX : onglets mobiles, questionnaire plein écran, sommaire du voyage, Itinéraire / Carte, accessibilité
