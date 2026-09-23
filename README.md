# OVO — « Où On Va ? »

Plateforme de voyage pour les 18–30 ans : l'utilisateur indique ses envies, son budget, ses dates,
le nombre de voyageurs et son style, et OVO lui propose un voyage personnalisé.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (design tokens dans `src/app/globals.css`)
- Supabase (base de données + authentification, via `@supabase/ssr`)
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
│   └── landing/              # Sections de la landing page
├── config/                   # Config du site (nav, routes, images, réseaux sociaux)
├── data/                     # Données statiques de démonstration
├── lib/
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

## Feuille de route

- [x] Étape 1 — Fondations + landing page
- [ ] Questionnaire de création de voyage
- [ ] Génération de voyage & page de résultats
- [ ] Authentification Supabase, profil, voyages sauvegardés
- [ ] Partage, carte interactive, export PDF
- [ ] OVO Premium & paiements
