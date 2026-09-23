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
