@AGENTS.md

# OVO — notes projet

- Voir `README.md` pour l'architecture et la feuille de route.
- Interface en français, public 18–30 ans ; palette bleu nuit (`night-*`), orange (`sun-*`), doré (`gold-*`).
- Construire progressivement : ne pas casser l'existant, réutiliser `components/ui` et `config/site.ts`.
- Avant de pousser : `npm run lint && npm run typecheck && npm test && npm run build`.
- Le moteur (`src/features/trip-engine`) ne lit les données que via `TravelDataSource` ; les prix affichés sont toujours présentés comme des estimations.
- Ne pas nommer `useXxx` une fonction qui n'est pas un hook : les règles React du linter deviennent extrêmement lentes.
- Comptes : l'autorisation se vérifie côté serveur (`getCurrentUser`, Server Actions) + RLS ; `useAuth()` ne sert qu'à l'affichage. Toute nouvelle table utilisateur a ses politiques RLS dans `supabase/migrations/`.
- Premium : déclarer une fonctionnalité ou une limite dans `src/config/premium.ts`, la protéger avec `<PremiumFeature>` (affichage) ET `canUseFeature()` (route/action). Ne jamais retirer une fonctionnalité gratuite existante ; aucun paiement tant que l'étape Stripe n'est pas faite.
