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
