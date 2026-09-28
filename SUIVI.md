# Suivi du projet OVO

À lire en premier pour reprendre le projet.

## Où en est-on

- **Le site est en ligne** sur https://www.ovovoyage.com (et https://ovo-creation.vercel.app) : il est hébergé par Vercel, qui déploie la branche `claude/ovo-travel-platform-24gema`.
- **Supabase** est en place : base créée avec `supabase/setup.sql`, Site URL et Redirect URL réglées sur l'adresse Vercel. L'inscription, la connexion et les voyages enregistrés ont été vérifiés en ligne.
- **Stripe fonctionne en mode test** : produits OVO Medium à 5,99 € et OVO Premium à 9,99 €, webhook vers `/api/stripe/webhook` avec 6 événements, portail client enregistré. Un abonnement de test payé avec la carte 4242 a été vérifié en ligne et apparaît dans « Mon compte ».
- **Variables Vercel** (Production) : Supabase (URL, clé anon, clé service_role), `CRON_SECRET`, les 4 variables Stripe et la clé publiable.
  - `NEXT_PUBLIC_SITE_URL` est facultative : le site utilise l'adresse de la requête ou l'adresse Vercel.
  - Vercel refuse d'enregistrer une variable `NEXT_PUBLIC_…` en type « Secret » : il faut choisir le type **Config**.
- **Logo** : les fichiers PNG et SVG ont été générés et envoyés au propriétaire du projet. Ils ne sont pas dans le dépôt.

## Checklist pour la prochaine séance

**En attente (rien à faire, juste surveiller ses emails) :**

- [ ] SIRET (INSEE, 1 à 4 semaines) → l'envoyer pour le mettre sur le site.
- [ ] Réponses de Travelpayouts (GetYourGuide, Booking) → générer les liens et les envoyer.

**Dès réception du SIRET :**

- [ ] Choisir un médiateur de la consommation (CM2C ou Medicys) et envoyer son nom + son lien.
- [ ] Activer Stripe en mode réel (identité, IBAN), puis recréer offres, webhook et portail en live.
- [ ] Choisir l'hébergement commercial : Vercel Pro (environ 20 $ par mois) ou migration gratuite vers Cloudflare.
- [ ] Faire relire les textes légaux.

**Quand tu veux (gratuit) :**

- [ ] Google Search Console (voir « Recommandé » plus bas).
- [ ] Réserver `@ovovoyage` sur Instagram et TikTok, puis envoyer les liens.
- [ ] Faire tester le site à quelques amis sur téléphone.

**Idées de code pour la suite :** une page par destination pour Google, la page « À propos », OVO installable sur l'écran d'accueil, les hébergements réels et les prix en temps réel.

## Reste à faire

### Avant d'encaisser de vrais clients

1. **Données réelles : bien avancé.**
   - **50 destinations complètes** (activités réelles, vrais restaurants avec lien Google Maps, carte, prix moyens, meilleurs mois) :
     - Europe : Lisbonne, Porto, Barcelone, Madrid, Séville, Valence, Ibiza, Rome, Florence, Naples, Venise, Milan, Palerme, Amsterdam, Bruxelles, Berlin, Copenhague, Vienne, Prague, Budapest, Cracovie, Ljubljana, Tallinn, Londres, Édimbourg, Dublin, Reykjavik, Athènes, Santorin, Split, Kotor, Malte ;
     - France : Nice, Marseille, Bordeaux ;
     - Monde : Istanbul, Tbilissi, Marrakech, Agadir, Le Caire, Dubaï, Tokyo, Séoul, Bangkok, Bali, Hanoï, New York, Montréal, Mexico, Rio de Janeiro.
     - Les autres villes ont un programme type (sans adresses). Agadir et Kotor ont des restaurants d'exemple (« OVO »), faute d'adresses assez sûres.
   - Les restaurants viennent de connaissances générales (adresses établies) : un établissement peut avoir fermé, d'où le lien Google Maps et la mention « vérifie les horaires ». À relire de temps en temps.
   - **Liens partenaires** (Travelpayouts : identifiant partenaire (marker) `783013`, projet `578967`, voir `src/config/affiliate.ts`) : vols Aviasales (commission via le marker), hébergements Booking.com et activités GetYourGuide (liens directs, sans commission tant que les paramètres Travelpayouts de ces programmes ne sont pas renseignés). Projet en cours d'examen par Travelpayouts (GetYourGuide demande un site d'au moins 2 mois). Script « Drive » de Travelpayouts installé (exigé par Travelpayouts) : chargé **seulement après accord** via le bandeau « Cookies partenaires », jamais sur les pages de compte, connexion ou paiement (`src/features/consent/`). Lien « Gérer les cookies » dans le pied de page.
   - Reste : hébergements (encore des exemples), prix en temps réel via les API partenaires (`TravelDataSource`).
2. **Statut juridique : en cours.** Création de la micro-entreprise sur https://formalites.entreprises.gouv.fr (gratuit), **dossier déposé et signé le 27/09/2026** (formalité INPI n° J00285419354, suivi sur https://procedures.inpi.fr → Entreprises → « Suivre l'avancement d'une formalité d'entreprise »). En attente du SIRET (1 à 4 semaines), puis choisir un médiateur de la consommation. Choix déjà faits :
   - assurance maladie actuelle : CPAM ;
   - activité : **pas « agence de voyage »** (activité réglementée, et OVO ne vend pas de voyages). Choisir « portail internet » (63.12Z) ou « édition de logiciels » (58.29C), en prestation de services commerciale (BIC) ;
   - versement libératoire : **non** (activable plus tard).
3. **Pages légales : à compléter.** Les pages Mentions légales, Conditions générales (CGU + CGV), Confidentialité et Contact sont en ligne. Éditeur, adresse, email et TVA sont remplis ; restent le SIRET et le médiateur, qui s'affichent en jaune « à compléter » : il suffit de les remplir dans `src/config/legal.ts`. Ces textes sont des modèles, à faire relire avant l'ouverture au public.
4. **Stripe en mode live** : activer le compte (identité, IBAN), recréer les produits, le webhook et le portail en live, remplacer les 4 variables Stripe dans Vercel, puis redéployer. Voir `MISE-EN-LIGNE.md`, section 7.
5. **Vercel Pro**, obligatoire pour un usage commercial.

### Recommandé

- **Nom de domaine : `ovovoyage.com`**, acheté dans Vercel et relié au projet. L'adresse principale est **`https://www.ovovoyage.com`** (`ovovoyage.com` redirige vers le www). Webhook Stripe réglé sur `https://www.ovovoyage.com/api/stripe/webhook` : Stripe ne suit pas les redirections, il faut donc l'URL exacte avec www. Inscription et paiement test vérifiés sur le domaine. Reste : Supabase Site URL `https://www.ovovoyage.com` et Redirect URL `https://www.ovovoyage.com/auth/confirm`, puis Google Search Console.
- ~~Service d'emails~~ : **fait.** Brevo est branché sur Supabase avec le domaine `ovovoyage.com` authentifié et l'expéditeur `noreply@ovovoyage.com`. Les emails en français aux couleurs d'OVO sont en place (`supabase/templates/`) et ont été testés. Voir `MISE-EN-LIGNE.md`, section 8.
- **Test complet sur téléphone** : annulation et changement d'offre via « Gérer mon abonnement ».
- **Région des fonctions Vercel** : elles tournent aujourd'hui à Washington (`iad1`). Les placer à Paris (`cdg1`) les rapprocherait des utilisateurs et de Supabase.

## Documents utiles

- `MISE-EN-LIGNE.md` : mise en ligne pas à pas (Supabase, Vercel, Stripe, domaine, passage en live).
- `DEMARRAGE.md` : lancer le projet sur son ordinateur.
- `README.md` : architecture et fonctionnement.
- `CLAUDE.md` : règles du projet.
