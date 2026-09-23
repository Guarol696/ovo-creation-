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
