-- EMPIRE — schéma initial.
-- Principe : chaque utilisateur ne lit et n'écrit que ses propres lignes (RLS).
-- L'abonnement et les achats ne sont JAMAIS écrits par l'utilisateur :
-- seul le webhook Stripe (clé service_role, côté serveur) les met à jour.

-- ─── Profils ───────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profil : lecture du sien" on public.profiles for select using (auth.uid() = id);
create policy "profil : modification du sien" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Profil créé automatiquement à l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Catalogue (lecture publique) ──────────────────────────────────
-- Le site lit aujourd'hui le catalogue de démonstration dans le code
-- (src/data/courses) ; ces tables accueilleront le vrai catalogue.
create table if not exists public.courses (
  slug text primary key,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  category text not null,
  level text not null check (level in ('debutant', 'intermediaire', 'avance')),
  access text not null check (access in ('free', 'pro', 'premium')),
  objectives text[] not null default '{}',
  instructor_name text,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.course_modules (
  course_slug text not null references public.courses (slug) on delete cascade,
  slug text not null,
  title text not null,
  position int not null default 0,
  primary key (course_slug, slug)
);
create table if not exists public.lessons (
  course_slug text not null,
  module_slug text not null,
  slug text not null,
  title text not null,
  summary text not null default '',
  minutes int not null default 0 check (minutes >= 0),
  body text not null default '',
  video_url text,
  position int not null default 0,
  primary key (course_slug, slug),
  foreign key (course_slug, module_slug) references public.course_modules (course_slug, slug) on delete cascade
);
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
create policy "catalogue : formations publiées" on public.courses for select using (published);
create policy "catalogue : modules publiés" on public.course_modules for select
  using (exists (select 1 from public.courses c where c.slug = course_slug and c.published));
-- Le contenu des leçons payantes ne doit pas être lisible directement : seule la
-- liste (titres) est publique ; le contenu complet est servi par le serveur après
-- vérification de l'offre. Cette politique n'expose que les leçons gratuites.
create policy "catalogue : leçons des formations gratuites" on public.lessons for select
  using (exists (select 1 from public.courses c where c.slug = course_slug and c.published and c.access = 'free'));

-- ─── Inscriptions & progression ───────────────────────────────────
create table if not exists public.enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null check (char_length(course_slug) <= 120),
  last_lesson_slug text check (char_length(last_lesson_slug) <= 120),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);
create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null check (char_length(course_slug) <= 120),
  lesson_slug text not null check (char_length(lesson_slug) <= 120),
  completed_at timestamptz,
  position_seconds int not null default 0 check (position_seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug)
);
create table if not exists public.lesson_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null check (char_length(course_slug) <= 120),
  lesson_slug text not null check (char_length(lesson_slug) <= 120),
  body text not null default '' check (char_length(body) <= 10000),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_slug)
);

-- ─── Projets personnels ───────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  kind text not null check (kind in ('site', 'boutique', 'application', 'marque', 'produit', 'entreprise')),
  status text not null default 'idee' check (status in ('idee', 'en-cours', 'lance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_user_idx on public.projects (user_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['enrollments', 'lesson_progress', 'lesson_notes', 'projects'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s : lecture des siens" on public.%1$I for select using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s : ajout des siens" on public.%1$I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s : modification des siens" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s : suppression des siens" on public.%1$I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ─── Abonnements & achats (écrits uniquement par le webhook Stripe) ─
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "abonnement : lecture du sien" on public.subscriptions for select using (auth.uid() = user_id);
-- Aucune politique insert/update/delete : seul le rôle service_role (qui contourne la RLS) écrit.

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text,
  stripe_checkout_session_id text unique not null,
  amount_total int,
  currency text,
  status text not null,
  created_at timestamptz not null default now()
);
alter table public.purchases enable row level security;
create policy "achats : lecture des siens" on public.purchases for select using (auth.uid() = user_id);

-- Événements Stripe déjà traités (idempotence du webhook). Aucun accès client.
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
