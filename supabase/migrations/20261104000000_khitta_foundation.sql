-- KHITTA V2 — database foundation: accounts, projects and plan history.
--
-- Every table has Row Level Security: a signed-in user can only read and
-- write rows they own, and a row can only point at a project they own.
-- Anonymous visitors get no access at all. The no-account journey keeps
-- working without the database.
--
-- Tables
--   profiles             one per user (preferred interface language)
--   projects             a user's businesses (the "My projects" dashboard)
--   core_versions        each version of a project's core information
--   generation_runs      each time Claude generated modules for a project
--   module_revisions     each saved version of a plan module (never edited)
--   module_translations  a revision's text in the other interface language

-- ---------------------------------------------------------------------------
-- Helpers
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
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- A profile is created with every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  status text not null default 'draft'
    check (status in ('draft', 'generating', 'ready', 'failed', 'archived')),
  -- Set once the first core version exists (foreign key added below).
  current_core_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_updated_idx on public.projects (owner_id, updated_at desc);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- core_versions
-- ---------------------------------------------------------------------------

create table public.core_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  version integer not null check (version >= 1),
  -- The idea in the founder's own words.
  idea text not null,
  -- The onboarding answers as given ({ id, label, value }[]).
  answers jsonb not null,
  -- The same information as language-neutral codes and numbers (CoreInfo).
  core_info jsonb not null,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create index core_versions_project_idx on public.core_versions (project_id, version desc);

alter table public.projects
  add constraint projects_current_core_version_fkey
  foreign key (current_core_version_id) references public.core_versions (id) on delete set null;

-- ---------------------------------------------------------------------------
-- generation_runs
-- ---------------------------------------------------------------------------

create table public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  core_version_id uuid not null references public.core_versions (id) on delete cascade,
  locale text not null check (locale in ('en', 'ar')),
  module_keys text[] not null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  error text,
  model text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index generation_runs_project_idx on public.generation_runs (project_id, started_at desc);

-- ---------------------------------------------------------------------------
-- module_revisions
-- ---------------------------------------------------------------------------

create table public.module_revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  module_key text not null check (module_key in (
    'assessment', 'financials', 'narrative', 'setup', 'suppliers',
    'marketing_strategy', 'marketing_execution', 'marketing_calendar'
  )),
  -- Claude's structured output for this module, validated by the app.
  output jsonb not null,
  core_version_id uuid not null references public.core_versions (id) on delete cascade,
  generation_run_id uuid references public.generation_runs (id) on delete set null,
  -- The revisions of the upstream modules this one read, by module key.
  upstream_revision_ids jsonb not null default '{}'::jsonb,
  -- Language of the written text in `output`.
  source_locale text not null check (source_locale in ('en', 'ar')),
  schema_version integer not null default 1,
  prompt_version integer not null default 1,
  model text,
  source text not null default 'ai' check (source in ('ai', 'user')),
  created_at timestamptz not null default now()
);

create index module_revisions_latest_idx
  on public.module_revisions (project_id, module_key, created_at desc);

-- ---------------------------------------------------------------------------
-- module_translations
-- ---------------------------------------------------------------------------

create table public.module_translations (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.module_revisions (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  locale text not null check (locale in ('en', 'ar')),
  output jsonb not null,
  model text,
  created_at timestamptz not null default now(),
  unique (revision_id, locale)
);

-- ---------------------------------------------------------------------------
-- "Last updated" on the dashboard: new versions, runs and revisions touch
-- their project. Runs as the user, so Row Level Security still applies.
-- ---------------------------------------------------------------------------

create or replace function public.touch_project()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.projects set updated_at = now() where id = new.project_id;
  return new;
end;
$$;

create trigger core_versions_touch_project
  after insert on public.core_versions
  for each row execute function public.touch_project();

create trigger generation_runs_touch_project
  after insert or update on public.generation_runs
  for each row execute function public.touch_project();

create trigger module_revisions_touch_project
  after insert on public.module_revisions
  for each row execute function public.touch_project();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.core_versions enable row level security;
alter table public.generation_runs enable row level security;
alter table public.module_revisions enable row level security;
alter table public.module_translations enable row level security;

-- Anonymous visitors get nothing; signed-in users get only what the policies allow.
revoke all on public.profiles, public.projects, public.core_versions, public.generation_runs,
  public.module_revisions, public.module_translations from anon;

-- True when the signed-in user owns this project.
create or replace function public.owns_project(target uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = target and p.owner_id = (select auth.uid())
  );
$$;

-- profiles: read and update your own (created automatically on sign-up).
create policy "Users read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- projects: full control over your own.
create policy "Users read their own projects" on public.projects
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users create their own projects" on public.projects
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Users update their own projects" on public.projects
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    -- The current core version must be one of this project's own versions.
    and (
      current_core_version_id is null
      or exists (
        select 1 from public.core_versions c
        where c.id = projects.current_core_version_id and c.project_id = projects.id
      )
    )
  );
create policy "Users delete their own projects" on public.projects
  for delete to authenticated using (owner_id = (select auth.uid()));

-- core_versions: history is read and added to, never changed.
create policy "Users read their own core versions" on public.core_versions
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users add core versions to their own projects" on public.core_versions
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.owns_project(project_id));

-- generation_runs: added, then updated with their outcome.
create policy "Users read their own generation runs" on public.generation_runs
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users start generation runs on their own projects" on public.generation_runs
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and public.owns_project(project_id)
    and exists (
      select 1 from public.core_versions c
      where c.id = generation_runs.core_version_id and c.project_id = generation_runs.project_id
    )
  );
create policy "Users finish their own generation runs" on public.generation_runs
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and public.owns_project(project_id));

-- module_revisions: never edited; a change is a new revision.
create policy "Users read their own module revisions" on public.module_revisions
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users add module revisions to their own projects" on public.module_revisions
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and public.owns_project(project_id)
    and exists (
      select 1 from public.core_versions c
      where c.id = module_revisions.core_version_id and c.project_id = module_revisions.project_id
    )
    and (
      generation_run_id is null
      or exists (
        select 1 from public.generation_runs g
        where g.id = module_revisions.generation_run_id and g.project_id = module_revisions.project_id
      )
    )
  );

-- module_translations: added once per revision and language.
create policy "Users read their own module translations" on public.module_translations
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Users add translations of their own revisions" on public.module_translations
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.module_revisions r
      where r.id = module_translations.revision_id and r.owner_id = (select auth.uid())
    )
  );
