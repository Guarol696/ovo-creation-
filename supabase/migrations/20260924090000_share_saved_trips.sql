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
