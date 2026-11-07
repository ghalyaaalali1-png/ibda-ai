-- A project's business name in the other interface language, when the
-- founder typed it in one language and views the project in the other
-- ({ "ar": "كشك قهوة مختصة" }). Covered by the existing project policies.
alter table public.projects
  add column name_translations jsonb not null default '{}'::jsonb;
