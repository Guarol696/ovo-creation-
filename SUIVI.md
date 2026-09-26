# Suivi du projet OVO

À lire en premier pour reprendre le projet.

## Où en est-on

- **Le site est en ligne** sur https://ovo-creation.vercel.app : il est hébergé par Vercel, qui déploie la branche `claude/ovo-travel-platform-24gema`.
- **Supabase** est en place : base créée avec `supabase/setup.sql`, Site URL et Redirect URL réglées sur l'adresse Vercel. L'inscription, la connexion et les voyages enregistrés ont été vérifiés en ligne.
- **Stripe fonctionne en mode test** : produits OVO Medium à 5,99 € et OVO Premium à 9,99 €, webhook vers `/api/stripe/webhook` avec 6 événements, portail client enregistré. Un abonnement de test payé avec la carte 4242 a été vérifié en ligne et apparaît dans « Mon compte ».
- **Variables Vercel** (Production) : Supabase (URL, clé anon, clé service_role), `CRON_SECRET`, les 4 variables Stripe et la clé publiable.
  - `NEXT_PUBLIC_SITE_URL` est facultative : le site utilise l'adresse de la requête ou l'adresse Vercel.
  - Vercel refuse d'enregistrer une variable `NEXT_PUBLIC_…` en type « Secret » : il faut choisir le type **Config**.
- **Logo** : les fichiers PNG et SVG ont été générés et envoyés au propriétaire du projet. Ils ne sont pas dans le dépôt.

## Reste à faire

### Avant d'encaisser de vrais clients

1. **Données réelles.** Hôtels, restaurants, activités et prix sont aujourd'hui des données de démonstration, signalées comme telles sur le site. Il faut brancher de vraies sources (API) via `TravelDataSource`.
2. **Statut juridique** pour encaisser, par exemple micro-entreprise avec un SIRET.
3. **Pages légales** : mentions légales, CGV (droit de rétractation pour les abonnements numériques) et politique de confidentialité conforme au RGPD.
4. **Stripe en mode live** : activer le compte (identité, IBAN), recréer les produits, le webhook et le portail en live, remplacer les 4 variables Stripe dans Vercel, puis redéployer. Voir `MISE-EN-LIGNE.md`, section 7.
5. **Vercel Pro**, obligatoire pour un usage commercial.

### Recommandé

- **Nom de domaine**, par exemple `ovo-voyage.fr`. On peut l'acheter dans Vercel (Settings → Domains). Il faut ensuite mettre à jour la Site URL et les Redirect URLs dans Supabase, ainsi que l'URL du webhook Stripe.
- **Service d'emails** (Brevo, Resend…) dans Supabase → Authentication → SMTP : le service gratuit de Supabase n'envoie que quelques emails par heure.
- **Test complet sur téléphone** : annulation et changement d'offre via « Gérer mon abonnement ».
- **Région des fonctions Vercel** : elles tournent aujourd'hui à Washington (`iad1`). Les placer à Paris (`cdg1`) les rapprocherait des utilisateurs et de Supabase.

## Documents utiles

- `MISE-EN-LIGNE.md` : mise en ligne pas à pas (Supabase, Vercel, Stripe, domaine, passage en live).
- `DEMARRAGE.md` : lancer le projet sur son ordinateur.
- `README.md` : architecture et fonctionnement.
- `CLAUDE.md` : règles du projet.
