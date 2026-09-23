-- OVO : installation complète de la base (généré par `npm run db:bundle`, ne pas modifier).
-- À exécuter UNE SEULE FOIS sur un projet Supabase neuf : SQL Editor > New query > coller > Run.
-- Contient, dans l'ordre : 20260923120000_create_trip_requests.sql, 20260923150000_saved_trips_and_profiles.sql, 20260924090000_share_saved_trips.sql, 20260925090000_subscriptions.sql, 20260926090000_stripe_billing.sql, 20260927090000_stripe_webhook_events.sql.

-- =====================================================================
-- 20260923120000_create_trip_requests.sql
-- =====================================================================

-- Demandes de voyage issues du questionnaire « Créer mon voyage ».
-- Le détail des réponses est stocké en JSON (type TripRequest côté app)
-- pour pouvoir faire évoluer le questionnaire sans migration à chaque fois.

create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists trip_requests_user_id_created_at_idx
  on public.trip_requests (user_id, created_at desc);

alter table public.trip_requests enable row level security;

create policy "Les utilisateurs lisent leurs demandes"
  on public.trip_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Les utilisateurs créent leurs demandes"
  on public.trip_requests for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Les utilisateurs suppriment leurs demandes"
  on public.trip_requests for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- 20260923150000_saved_trips_and_profiles.sql
-- =====================================================================

-- Étape 7 : comptes utilisateurs et voyages sauvegardés.
--
-- 1. `profiles` : informations publiques du compte (prénom / pseudo).
-- 2. `saved_trips` : voyages enregistrés. On réutilise la table `trip_requests`
--    (étape 2) plutôt que d'en créer une seconde qui dupliquerait la demande :
--    elle est renommée et complétée avec le TravelPlan et ses champs d'affichage.
--
-- Sécurité : Row Level Security sur les deux tables. Un utilisateur ne voit,
-- ne crée, ne modifie et ne supprime QUE ses propres lignes.

-- ---------------------------------------------------------------------------
-- Fonction utilitaire : mise à jour automatique de updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Chacun lit son profil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Chacun modifie son profil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pas de politique insert/delete : le profil est créé par le trigger ci-dessous
-- et supprimé avec le compte (on delete cascade).
revoke all on public.profiles from anon;
revoke insert, delete, truncate, references, trigger on public.profiles from authenticated;

-- Création automatique du profil à l'inscription (prénom transmis dans les métadonnées).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40);
begin
  if name = '' then
    name := left(split_part(coalesce(new.email, 'voyageur'), '@', 1), 40);
  end if;
  insert into public.profiles (id, display_name) values (new.id, name)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profils des comptes créés avant cette migration.
insert into public.profiles (id, display_name)
select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(email, 'voyageur'), '@', 1)), 40)
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Voyages sauvegardés (anciennement trip_requests)
-- ---------------------------------------------------------------------------
alter table public.trip_requests rename to saved_trips;
alter table public.saved_trips rename column payload to request;
alter index if exists trip_requests_user_id_created_at_idx rename to saved_trips_user_id_created_at_idx;
alter table public.saved_trips rename constraint trip_requests_pkey to saved_trips_pkey;
alter table public.saved_trips rename constraint trip_requests_user_id_fkey to saved_trips_user_id_fkey;

alter table public.saved_trips
  alter column user_id set default auth.uid(),
  add column title text,
  add column destination text,
  add column country text,
  add column country_code text check (country_code ~ '^[A-Z]{2}$'),
  add column start_date date,
  add column end_date date,
  add column duration smallint check (duration between 1 and 60),
  add column travelers smallint check (travelers between 1 and 20),
  add column budget integer check (budget >= 0),
  -- Empreinte de la demande : évite d'enregistrer deux fois le même voyage.
  add column request_hash text,
  -- TravelPlan complet (JSON) : réaffiché tel quel, sans nouvelle génération.
  add column travel_plan jsonb,
  add column updated_at timestamptz not null default now();

-- Anciennes lignes (demandes enregistrées automatiquement à l'étape 2, sans TravelPlan) :
-- titre et destination déduits de la demande ; le voyage sera recalculé à l'ouverture.
update public.saved_trips
set
  destination = coalesce(nullif(request #>> '{destination,place,name}', ''), 'Destination surprise'),
  country = nullif(request #>> '{destination,place,country}', ''),
  title = 'Voyage à ' || coalesce(nullif(request #>> '{destination,place,name}', ''), 'destination surprise')
where title is null;

alter table public.saved_trips
  alter column title set not null,
  alter column destination set not null,
  add constraint saved_trips_title_length check (char_length(title) between 1 and 120),
  add constraint saved_trips_dates_order check (end_date is null or start_date is null or end_date >= start_date),
  -- Garde-fou de taille (un TravelPlan fait quelques dizaines de Ko).
  add constraint saved_trips_plan_size check (travel_plan is null or pg_column_size(travel_plan) < 1000000),
  add constraint saved_trips_plan_object check (travel_plan is null or jsonb_typeof(travel_plan) = 'object');

create unique index if not exists saved_trips_user_id_request_hash_key
  on public.saved_trips (user_id, request_hash);

create trigger saved_trips_set_updated_at
  before update on public.saved_trips
  for each row execute function public.set_updated_at();

-- Politiques RLS : on remplace celles de trip_requests par un jeu complet.
drop policy if exists "Les utilisateurs lisent leurs demandes" on public.saved_trips;
drop policy if exists "Les utilisateurs créent leurs demandes" on public.saved_trips;
drop policy if exists "Les utilisateurs suppriment leurs demandes" on public.saved_trips;

create policy "Chacun lit ses voyages"
  on public.saved_trips for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Chacun crée ses voyages"
  on public.saved_trips for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Chacun modifie ses voyages"
  on public.saved_trips for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Chacun supprime ses voyages"
  on public.saved_trips for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Les visiteurs non connectés n'ont aucun accès.
revoke all on public.saved_trips from anon;

-- =====================================================================
-- 20260924090000_share_saved_trips.sql
-- =====================================================================

-- Étape 8 : partage d'un voyage enregistré par lien.
--
-- Un voyage enregistré est PRIVÉ par défaut. Son propriétaire peut le rendre
-- partageable : un jeton secret aléatoire (share_token) est alors créé, et le
-- lien /voyage/partage/<jeton> permet de le consulter sans compte.
-- Désactiver le partage efface le jeton : l'ancien lien ne fonctionne plus.
--
-- Sécurité (sans contourner la RLS, sans fonction SECURITY DEFINER) :
-- - le rôle `anon` ne peut lire QUE certaines colonnes (jamais user_id, la
--   demande brute, l'empreinte ni les dates d'enregistrement) ;
-- - la politique RLS n'autorise la lecture d'un voyage que s'il est partagé ET
--   que la requête présente son jeton (en-tête HTTP x-ovo-share-token, exposé par
--   PostgREST dans request.headers) : impossible de lister les voyages partagés.

alter table public.saved_trips
  add column is_public boolean not null default false,
  add column share_token uuid unique,
  add column shared_at timestamptz,
  add constraint saved_trips_share_consistency check (not is_public or share_token is not null);

-- Le TravelPlan enregistré ne conserve pas le texte libre « envie particulière »
-- (il reste dans la colonne privée `request`, réservée au propriétaire).
update public.saved_trips
set travel_plan = jsonb_set(travel_plan, '{request,wishes}', 'null'::jsonb)
where travel_plan is not null
  and jsonb_typeof(travel_plan -> 'request') = 'object'
  and travel_plan #>> '{request,wishes}' is not null;

-- Colonnes lisibles par un visiteur (et uniquement celles-ci).
grant select (
  share_token, is_public, shared_at, title, destination, country, country_code,
  start_date, end_date, duration, travelers, budget, travel_plan
) on public.saved_trips to anon;

create policy "Lecture d'un voyage partagé avec son lien"
  on public.saved_trips for select
  to anon
  using (
    is_public
    and share_token is not null
    and share_token::text = (current_setting('request.headers', true)::json ->> 'x-ovo-share-token')
  );

-- =====================================================================
-- 20260925090000_subscriptions.sql
-- =====================================================================

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

-- =====================================================================
-- 20260926090000_stripe_billing.sql
-- =====================================================================

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

-- =====================================================================
-- 20260927090000_stripe_webhook_events.sql
-- =====================================================================

-- Étape 10 : idempotence des webhooks Stripe.
--
-- Stripe peut livrer un même événement plusieurs fois (relances, doublons).
-- Chaque événement est enregistré avant traitement : un événement déjà traité
-- n'est pas retraité, un événement en cours de traitement est refusé
-- temporairement (Stripe relivrera), un traitement échoué peut être repris.
-- Table interne : aucun accès pour les utilisateurs (RLS sans politique).

create table public.stripe_webhook_events (
  event_id text primary key check (event_id ~ '^evt_[A-Za-z0-9_]+$'),
  event_type text not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  attempts integer not null default 1 check (attempts > 0),
  result text,
  last_error text,
  stripe_created_at timestamptz,
  received_at timestamptz not null default now(),
  claimed_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint stripe_webhook_events_processed check ((status = 'processed') = (processed_at is not null))
);

comment on table public.stripe_webhook_events is
  'Événements Stripe reçus par le webhook (idempotence). Écrit uniquement par le serveur (service_role).';

create index stripe_webhook_events_received_at_idx on public.stripe_webhook_events (received_at);

alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from public, anon, authenticated;
grant select, insert, update, delete on public.stripe_webhook_events to service_role;

-- Réserve un événement pour traitement, de façon atomique.
--   'process'     : à traiter (nouvel événement, échec précédent ou traitement bloqué depuis 5 min) ;
--   'duplicate'   : déjà traité, ne rien refaire ;
--   'in_progress' : en cours de traitement ailleurs, réessayer plus tard.
create or replace function public.claim_stripe_webhook_event(
  p_event_id text,
  p_event_type text,
  p_stripe_created_at timestamptz
) returns text
language plpgsql
set search_path = public
as $$
declare
  v_processed_at timestamptz;
begin
  insert into public.stripe_webhook_events (event_id, event_type, stripe_created_at)
  values (p_event_id, p_event_type, p_stripe_created_at)
  on conflict (event_id) do nothing;
  if found then
    return 'process';
  end if;

  update public.stripe_webhook_events
     set status = 'processing', attempts = attempts + 1, claimed_at = now(), last_error = null
   where event_id = p_event_id
     and processed_at is null
     and (status = 'failed' or claimed_at < now() - interval '5 minutes');
  if found then
    return 'process';
  end if;

  select processed_at into v_processed_at from public.stripe_webhook_events where event_id = p_event_id;
  return case when v_processed_at is not null then 'duplicate' else 'in_progress' end;
end;
$$;

revoke execute on function public.claim_stripe_webhook_event(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text, timestamptz) to service_role;
