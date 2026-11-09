-- KHITTA: let a signed-in user permanently delete their own account.
--
-- Deleting the auth user removes everything they own: every table references
-- auth.users with "on delete cascade" (profile, projects and, through them,
-- versions, runs, revisions and translations).
--
-- The function runs with the owner's rights because users can't delete from
-- auth.users themselves; it only ever deletes the caller (auth.uid()).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
