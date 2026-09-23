@AGENTS.md

# OVO — notes projet

- Voir `README.md` pour l'architecture et la feuille de route.
- Interface en français, public 18–30 ans ; palette bleu nuit (`night-*`), orange (`sun-*`), doré (`gold-*`).
- Construire progressivement : ne pas casser l'existant, réutiliser `components/ui` et `config/site.ts`.
- Avant de pousser : `npm run lint && npm run typecheck && npm test && npm run build`.
- Le moteur (`src/features/trip-engine`) ne lit les données que via `TravelDataSource` ; les prix affichés sont toujours présentés comme des estimations.
- Ne pas nommer `useXxx` une fonction qui n'est pas un hook : les règles React du linter deviennent extrêmement lentes.
- Comptes : l'autorisation se vérifie côté serveur (`getCurrentUser`, Server Actions) + RLS ; `useAuth()` ne sert qu'à l'affichage. Toute nouvelle table utilisateur a ses politiques RLS dans `supabase/migrations/`.
- Premium : déclarer une fonctionnalité ou une limite dans `src/config/premium.ts`, la protéger avec `<PremiumFeature>` (affichage) ET `canUseFeature()` (route/action). Ne jamais retirer une fonctionnalité gratuite existante.
- Stripe (`src/features/billing`) : clés et Price IDs uniquement côté serveur (variables d'environnement) ; le plan n'est écrit que par le webhook signé, après relecture de l'abonnement chez Stripe (client `service_role`) — jamais depuis une page de succès ni une donnée du navigateur.
