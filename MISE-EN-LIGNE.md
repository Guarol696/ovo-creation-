# Mettre OVO en ligne

Ce guide met OVO sur Internet avec **Vercel** (l'hébergement du site), **Supabase** (les comptes et les voyages enregistrés) et **Stripe** (les abonnements, d'abord en mode test).

Compte 1 h à 1 h 30 la première fois. Tu n'as rien à installer sur ton ordinateur : tout se fait dans le navigateur.

> Ordre conseillé : **1. Supabase → 2. Vercel → 3. Supabase (adresses) → 4. Stripe → 5. Tests.**
> Le site fonctionne dès l'étape 2 : questionnaire, voyages, carte, PDF. Les comptes s'activent à l'étape 3, les paiements à l'étape 4.

---

## Ce qu'il te faut

| Compte                                                 | Coût au départ                                             |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| GitHub (le code y est déjà)                            | Gratuit                                                    |
| Vercel — https://vercel.com (« Continue with GitHub ») | Gratuit (offre Hobby), voir la note sur les coûts plus bas |
| Supabase — https://supabase.com                        | Gratuit                                                    |
| Stripe — https://dashboard.stripe.com                  | Gratuit (commission uniquement sur les vrais paiements)    |

Le code à mettre en ligne est sur GitHub, dans le dépôt `guarol696/ovo-creation-`, branche `claude/ovo-travel-platform-24gema`.

---

## 1. Supabase : créer la base de données (10 min)

1. Sur https://supabase.com, clique sur **New project**.
   - Nom : `ovo`.
   - Mot de passe de la base : génère-le et garde-le dans un endroit sûr.
   - Région : **West EU (Paris)** ou **Central EU (Frankfurt)**.
2. Attends que le projet soit prêt, environ 2 minutes.
3. Ouvre **SQL Editor → New query**.
   - Colle **tout** le contenu du fichier `supabase/setup.sql` du dépôt. Sur GitHub, ouvre le fichier puis clique sur l'icône « Copy raw file ».
   - Clique sur **Run**. Le message « Success. No rows returned » est normal.
4. Ouvre **Project Settings → API** (ou « API Keys »). Note ces 3 valeurs, elles serviront à l'étape 2 :
   - **Project URL** : `https://xxxx.supabase.co`
   - clé **anon / public**
   - clé **service_role**. Elle est **secrète** : ne la mets jamais ailleurs que dans Vercel.

---

## 2. Vercel : mettre le site en ligne (15 min)

1. Sur https://vercel.com, connecte-toi avec **GitHub**.
2. Clique sur **Add New… → Project**, puis sur **Import** à côté de `ovo-creation-`.
   - Si le dépôt n'apparaît pas, clique sur « Adjust GitHub App Permissions » et autorise-le.
3. Vercel détecte **Next.js** tout seul. Ne touche ni à la commande de build ni au dossier.
4. Ouvre **Environment Variables** et ajoute ces variables, une par ligne :

   | Nom                             | Valeur                                                            |
   | ------------------------------- | ----------------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | Project URL de Supabase                                           |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon / public                                                 |
   | `SUPABASE_SERVICE_ROLE_KEY`     | clé service_role (secrète)                                        |
   | `CRON_SECRET`                   | une longue suite de lettres et chiffres (32 ou plus) de ton choix |

   Les variables Stripe viendront à l'étape 4.

5. Clique sur **Deploy** et attends 2 à 3 minutes.
6. Vercel te donne l'adresse du site, par exemple `https://ovo-creation-xxxx.vercel.app`. **Ouvre-la** : OVO est en ligne. 🎉
   - Note l'adresse de **Production** : dans le projet, en haut, la section « Domains ».

> **La branche.** Si le déploiement apparaît en « Preview » et non en « Production », va dans **Settings → Git → Production Branch** et indique `claude/ovo-travel-platform-24gema`. Relance ensuite un déploiement : onglet **Deployments → ⋯ → Redeploy**.

---

## 3. Supabase : autoriser l'adresse du site (5 min)

Sans cette étape, les emails de confirmation d'inscription renvoient vers une mauvaise adresse.

Dans Supabase, ouvre **Authentication → URL Configuration** :

- **Site URL** : l'adresse Vercel, par exemple `https://ovo-creation-xxxx.vercel.app`
- **Redirect URLs** : ajoute l'adresse suivie de `/auth/confirm`, par exemple `https://ovo-creation-xxxx.vercel.app/auth/confirm`

Teste ensuite sur le site : crée un compte, clique sur le lien reçu par email, enregistre un voyage.

> Le service d'email gratuit de Supabase n'envoie que quelques emails par heure. Avant d'ouvrir au public, configure un vrai service d'envoi dans **Authentication → SMTP Settings** (Brevo, Resend…).

---

## 4. Stripe : activer les abonnements en mode TEST (20 min)

Tout se fait avec l'interrupteur **Test mode** activé. Aucun vrai paiement n'est possible.

1. **Produits** : ouvre **Product catalog → Add product**.
   - « OVO Medium » : prix **récurrent**, **mensuel**, **5,99 EUR**.
   - « OVO Premium » : prix **récurrent**, **mensuel**, **9,99 EUR**.
   - Copie les deux identifiants `price_…`.
2. **Clés** : dans **Developers → API keys**, copie `pk_test_…` et `sk_test_…`.
3. **Webhook** : ouvre **Developers → Webhooks → Add endpoint**.
   - URL : `https://TON-ADRESSE.vercel.app/api/stripe/webhook`
   - Événements à cocher :
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Après création, copie le **Signing secret** `whsec_…`.
4. **Portail client** : ouvre **Settings → Billing → Customer portal** et active :
   - le changement d'offre, en ajoutant les 2 produits ;
   - l'annulation « à la fin de la période » ;
   - la mise à jour du moyen de paiement et l'historique des factures.

   Clique sur **Save**.

5. **Dans Vercel**, ouvre **Settings → Environment Variables** et ajoute :

   | Nom                                  | Valeur             |
   | ------------------------------------ | ------------------ |
   | `STRIPE_SECRET_KEY`                  | `sk_test_…`        |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…`        |
   | `STRIPE_WEBHOOK_SECRET`              | `whsec_…`          |
   | `STRIPE_MEDIUM_PRICE_ID`             | `price_…` à 5,99 € |
   | `STRIPE_PREMIUM_PRICE_ID`            | `price_…` à 9,99 € |

6. Relance un déploiement (**Deployments → ⋯ → Redeploy**) : les variables ne sont prises en compte qu'à ce moment-là.

---

## 5. Tester sur le site en ligne

1. Crée un compte, puis va sur **/premium** et clique sur **Commencer Medium**.
2. Paie avec la carte de test `4242 4242 4242 4242`, une date future et n'importe quel code à 3 chiffres.
3. De retour sur OVO, « Paiement reçu 🎉 » passe à « Abonnement confirmé ✓ » en quelques secondes.
4. **Mon compte** affiche OVO Medium. « Gérer mon abonnement » ouvre le portail Stripe.
5. Dans Stripe, **Developers → Webhooks → ton endpoint** : les événements doivent être marqués ✅ 200.
6. Refais le test avec la carte `4000 0000 0000 0002` : le paiement est refusé et l'offre reste Gratuit.

Si le paiement reste bloqué sur « Confirmation en cours » : vérifie l'URL du webhook et `STRIPE_WEBHOOK_SECRET`, puis relance un déploiement.

> Vérification rapide depuis ton ordinateur (facultatif) : copie les mêmes valeurs dans `.env.local` et lance `npm run doctor`. Le script vérifie Supabase et Stripe sans afficher les clés.

---

## 6. Plus tard : ton propre nom de domaine (facultatif)

1. Achète un domaine, par exemple chez OVH, Gandi ou Namecheap.
2. Dans Vercel, ouvre **Settings → Domains → Add** et suis les instructions DNS que Vercel affiche.
3. Une fois le domaine « Valid », ajoute la variable `NEXT_PUBLIC_SITE_URL` = `https://ton-domaine.fr` dans Vercel, puis relance un déploiement.
4. Remplace l'adresse `vercel.app` par ton domaine :
   - dans Supabase (étape 3) ;
   - dans le webhook Stripe (étape 4).

## 7. Le jour du lancement réel (paiements live)

Refais l'étape 4 avec l'interrupteur **Test mode désactivé**, c'est-à-dire en mode live. Cela donne de nouveaux produits, des clés `sk_live_…` / `pk_live_…`, un nouveau webhook et un nouveau portail. Remplace ensuite les 5 variables Stripe dans Vercel et relance un déploiement.

---

## Note sur les coûts

- **Vercel Hobby** (gratuit) est réservé à un usage **non commercial**. Dès que tu vends des abonnements, passe à **Vercel Pro**, environ 20 $ par mois.
- **Supabase Free** met le projet en pause après une semaine sans activité, et le limite à 500 Mo. Passe à Pro, environ 25 $ par mois, quand le site a de vrais utilisateurs.
- **Stripe** ne coûte rien sans vente, puis prend une commission par paiement, environ 1,5 % + 0,25 € pour une carte européenne.
