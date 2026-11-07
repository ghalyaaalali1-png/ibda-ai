-- Signed-in users need table access for the app to read and save their
-- projects (this Supabase project doesn't grant it to new tables
-- automatically). Row Level Security still limits every query to the user's
-- own rows; each grant matches what the policies allow. Visitors without an
-- account get nothing.

grant usage on schema public to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert on public.core_versions to authenticated;
grant select, insert, update on public.generation_runs to authenticated;
grant select, insert on public.module_revisions to authenticated;
grant select, insert on public.module_translations to authenticated;

grant execute on function public.owns_project(uuid) to authenticated;
revoke execute on function public.owns_project(uuid) from anon, public;
