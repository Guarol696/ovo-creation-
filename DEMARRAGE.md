# Lancer OVO sur ton ordinateur

Ce guide part de zéro. Compte environ 10 minutes pour voir OVO tourner (étapes 1 à 4). Ajoute 15 minutes pour les comptes (étape 5), puis la même chose pour Stripe (étape 6).

OVO fonctionne **dès l'étape 4**, sans aucune clé : questionnaire, génération du voyage, carte, budget et export PDF. Les comptes et les paiements s'ajoutent ensuite.

---

## 1. Installer les outils (une seule fois)

| Outil                                      | Pourquoi            | Où                                  |
| ------------------------------------------ | ------------------- | ----------------------------------- |
| **Node.js 22 LTS** (version 20.9 au moins) | faire tourner OVO   | https://nodejs.org → bouton « LTS » |
| **Git**                                    | récupérer le projet | https://git-scm.com/downloads       |
| Un éditeur, par exemple **VS Code**        | ouvrir `.env.local` | https://code.visualstudio.com       |

Vérifie dans un terminal (Windows : « Terminal » ou « PowerShell » ; Mac : « Terminal ») :

```bash
node -v    # doit afficher v22.x (ou au moins v20.9)
git --version
```

## 2. Récupérer le projet

Tout le code est sur la branche **`claude/ovo-travel-platform-24gema`** du dépôt GitHub `guarol696/ovo-creation-`.

```bash
git clone https://github.com/guarol696/ovo-creation-.git ovo
cd ovo
git checkout claude/ovo-travel-platform-24gema
```

> Sans Git : sur GitHub, choisis la branche `claude/ovo-travel-platform-24gema`, puis **Code → Download ZIP**. Décompresse l'archive et ouvre un terminal dans le dossier.

## 3. Installer et préparer

```bash
npm install        # installe les dépendances (1 à 2 minutes)
npm run setup      # vérifie Node.js et crée .env.local (ton fichier de configuration privé)
```

`.env.local` n'est **jamais** envoyé sur GitHub. C'est là que tu mettras tes clés.

## 4. Lancer OVO

```bash
npm run dev
```

Ouvre **http://localhost:3000**. Pour arrêter : `Ctrl + C` dans le terminal.

À ce stade, tout marche sauf les comptes et le paiement. Les pages concernées l'indiquent (« Les comptes arrivent très bientôt », « Le paiement n'est pas encore activé »).

---

## 5. Activer les comptes (Supabase, gratuit)

1. Crée un compte et un projet sur https://supabase.com. Note le mot de passe de la base, même s'il ne servira pas ici.
2. **Créer les tables** : dans le projet, ouvre **SQL Editor → New query**.
   - Colle **tout le contenu** du fichier `supabase/setup.sql`, puis clique sur **Run**.
   - Le message « Success. No rows returned » est normal. Fais-le une seule fois.
3. **Récupérer les clés** : ouvre **Project Settings → API** (ou **Data API / API Keys**). Copie ces valeurs dans `.env.local` :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - clé `anon` / `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - clé `service_role` → `SUPABASE_SERVICE_ROLE_KEY`. Cette clé est **secrète**. Elle est seulement nécessaire pour les abonnements : ne la partage jamais.
4. **Configurer les adresses** : ouvre **Authentication → URL Configuration**.
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : ajoute `http://localhost:3000/auth/confirm`
5. **Emails de confirmation** : Supabase envoie des emails de confirmation, mais seulement quelques-uns par heure avec son service gratuit.
   - Pour tester vite, tu peux désactiver **Authentication → Sign In / Providers → Email → Confirm email**.
   - Réactive-le avant la mise en ligne.
6. Arrête (`Ctrl + C`) puis relance `npm run dev` : les changements de `.env.local` ne sont lus qu'au démarrage.
7. Vérifie avec :

```bash
npm run doctor
```

Tu dois voir ✔ devant chaque ligne de la section Supabase.

---

## 6. Activer les abonnements (Stripe, mode test)

Le détail complet est dans le README, section « Configurer Stripe ». En bref :

1. Sur https://dashboard.stripe.com, active le **mode test** (interrupteur « Test mode »).
2. Crée deux produits avec un **prix mensuel récurrent en EUR** : **OVO Medium** à 5,99 € et **OVO Premium** à 9,99 €. Copie leurs identifiants `price_…`.
3. Copie les clés `pk_test_…` et `sk_test_…` depuis **Developers → API keys**.
4. Ouvre **Settings → Billing → Customer portal**. Active le changement d'offre (avec les deux produits), l'annulation, le moyen de paiement et les factures, puis clique sur **Save**.
5. Complète `.env.local` :

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_MEDIUM_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...     (étape 6.6)
```

6. **Webhook en local** : installe la CLI Stripe (https://docs.stripe.com/stripe-cli), puis, dans un **deuxième terminal** :

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`. **Laisse ce terminal ouvert** pendant tes tests : c'est lui qui prévient OVO quand un paiement est confirmé.

7. Relance `npm run dev`, puis `npm run doctor` : tout doit être ✔.
8. Teste le paiement avec la carte `4242 4242 4242 4242`, n'importe quelle date future et n'importe quel code.

---

## En cas de souci

| Problème                                        | Solution                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `node` ou `npm` introuvable                     | Réinstalle Node.js LTS, puis ferme et rouvre le terminal.                                        |
| `Port 3000 is in use`                           | Un autre `npm run dev` tourne déjà : ferme-le, ou lance `npm run dev -- -p 3001`.                |
| Rien ne change après avoir modifié `.env.local` | Arrête (`Ctrl + C`) puis relance `npm run dev`.                                                  |
| L'inscription n'envoie pas d'email              | Limite d'envoi de Supabase : attends, ou désactive « Confirm email » pour les tests (étape 5.5). |
| Le paiement reste sur « Confirmation en cours » | Le terminal `stripe listen` n'est pas lancé, ou `STRIPE_WEBHOOK_SECRET` ne correspond pas.       |
| N'importe quel autre doute                      | `npm run doctor` indique précisément ce qui manque.                                              |

## Commandes utiles

| Commande            | Rôle                                                       |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Lance OVO en développement (http://localhost:3000)         |
| `npm run setup`     | Crée `.env.local` et vérifie Node.js                       |
| `npm run doctor`    | Vérifie Supabase et Stripe                                 |
| `npm run check`     | Lint, types, tests et build (avant de publier)             |
| `npm run db:bundle` | Régénère `supabase/setup.sql` après une nouvelle migration |
