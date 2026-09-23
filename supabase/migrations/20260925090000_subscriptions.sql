-- Étape 9 : OVO Premium (structure uniquement, aucun paiement branché).
--
-- Une ligne par utilisateur ; sans ligne, l'utilisateur est sur l'offre gratuite.
-- Le plan réel est décidé par le serveur : un utilisateur peut LIRE son abonnement,
-- jamais le créer ni le modifier (aucune politique d'écriture, droits retirés).
-- Les changements passeront par le rôle service (futur webhook de paiement) ou
-- par un administrateur (SQL).
--
-- Colonnes `provider*` : prévues pour relier plus tard un fournisseur de paiement,
-- sans en dépendre aujourd'hui.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'trialing', 'canceled', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  provider text check (provider in ('manual', 'promo', 'stripe')),
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_period check (expires_at is null or expires_at > started_at)
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Chacun lit son abonnement"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Lecture seule pour les utilisateurs ; aucun accès pour les visiteurs.
revoke all on public.subscriptions from anon;
revoke insert, update, delete, truncate, references, trigger on public.subscriptions from authenticated;
