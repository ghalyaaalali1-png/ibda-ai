-- KHITTA: read-only share links for a project's plan.
--
-- The owner turns sharing on (a random, unguessable code is stored on the
-- project) or off (the code is cleared, so the old link stops working).
-- Anyone holding the link can read that one plan through shared_plan(), and
-- nothing else: no project id, owner, history or other projects are returned,
-- and the tables stay closed to visitors without an account.

alter table public.projects add column share_token uuid unique;

-- The plan behind a share link, or null if the link is wrong or turned off.
create or replace function public.shared_plan(token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with p as (
    select id, name, name_translations, updated_at, current_core_version_id
    from public.projects
    where share_token = token and token is not null and status <> 'archived'
  ),
  latest as (
    select distinct on (r.module_key) r.id, r.module_key, r.output, r.source_locale
    from public.module_revisions r
    join p on r.project_id = p.id
    order by r.module_key, r.created_at desc
  )
  select jsonb_build_object(
    'name', p.name,
    'name_translations', p.name_translations,
    'updated_at', p.updated_at,
    'idea', c.idea,
    'answers', c.answers,
    'revisions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'module_key', l.module_key, 'output', l.output, 'source_locale', l.source_locale))
      from latest l), '[]'::jsonb),
    'translations', coalesce((
      select jsonb_agg(jsonb_build_object('revision_id', t.revision_id, 'locale', t.locale, 'output', t.output))
      from public.module_translations t
      where t.revision_id in (select id from latest)), '[]'::jsonb)
  )
  from p
  join public.core_versions c on c.id = p.current_core_version_id;
$$;

revoke all on function public.shared_plan(uuid) from public;
grant execute on function public.shared_plan(uuid) to anon, authenticated;
