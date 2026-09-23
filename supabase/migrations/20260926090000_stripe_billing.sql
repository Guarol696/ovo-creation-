-- Étape 10 : abonnements payants avec Stripe (OVO Medium et OVO Premium).
--
-- La table `subscriptions` (étape 9) devient le reflet de l'abonnement Stripe.
-- Elle n'est écrite QUE par le serveur (rôle service, webhook Stripe et création
-- du client Stripe) ; l'utilisateur peut seulement lire sa propre ligne (RLS).

-- Offres : free, medium, premium.
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check check (plan in ('free', 'medium', 'premium'));

-- Statut : ceux de Stripe (null = aucun abonnement, ex. client Stripe créé sans paiement).
alter table public.subscriptions rename column status to subscription_status;
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions alter column subscription_status drop not null;
alter table public.subscriptions alter column subscription_status drop default;
update public.subscriptions set subscription_status = 'canceled' where subscription_status = 'expired';
alter table public.subscriptions
  add constraint subscriptions_status_check check (
    subscription_status is null or subscription_status in (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'
    )
  );

-- Période en cours (dates Stripe).
alter table public.subscriptions drop constraint if exists subscriptions_period;
alter table public.subscriptions rename column started_at to current_period_start;
alter table public.subscriptions rename column expires_at to current_period_end;
alter table public.subscriptions alter column current_period_start drop not null;
alter table public.subscriptions alter column current_period_start drop default;
alter table public.subscriptions
  add constraint subscriptions_period check (
    current_period_end is null or current_period_start is null or current_period_end >= current_period_start
  );

-- Identifiants Stripe (uniques : un client et un abonnement Stripe = un seul compte OVO).
alter table public.subscriptions drop column if exists provider_reference;
alter table public.subscriptions
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text unique,
  add column stripe_price_id text,
  add column cancel_at_period_end boolean not null default false,
  add column stripe_synced_at timestamptz;

-- Rappel sécurité (inchangé depuis l'étape 9) : lecture de sa propre ligne uniquement,
-- aucune écriture pour `authenticated` ni `anon`.
revoke all on public.subscriptions from anon;
revoke insert, update, delete, truncate, references, trigger on public.subscriptions from authenticated;

-- ---------------------------------------------------------------------------
-- OVO Premium : liens de partage à durée limitée.
-- ---------------------------------------------------------------------------
alter table public.saved_trips add column share_expires_at timestamptz;

drop policy if exists "Lecture d'un voyage partagé avec son lien" on public.saved_trips;
create policy "Lecture d'un voyage partagé avec son lien"
  on public.saved_trips for select
  to anon
  using (
    is_public
    and share_token is not null
    and (share_expires_at is null or share_expires_at > now())
    and share_token::text = (current_setting('request.headers', true)::json ->> 'x-ovo-share-token')
  );
