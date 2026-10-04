-- 새 Supabase 프로젝트의 SQL Editor에서 실행합니다.
-- 기존 테이블을 삭제하거나 데이터를 덮어쓰지 않습니다.
begin;

create table if not exists public.learning_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  content text not null check (char_length(btrim(content)) between 1 and 10000),
  topic text not null check (topic in ('React', 'JavaScript', 'HTML / CSS', '웹 기초', '기타')),
  status text not null default 'learning' check (status in ('learning', 'review', 'done')),
  learned_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_records_user_created_idx on public.learning_records (user_id, created_at desc, id);
alter table public.learning_records enable row level security;
revoke all on public.learning_records from anon;
grant select, insert, update, delete on public.learning_records to authenticated;

drop policy if exists "Read own records" on public.learning_records;
create policy "Read own records" on public.learning_records for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Create own records" on public.learning_records;
create policy "Create own records" on public.learning_records for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own records" on public.learning_records;
create policy "Update own records" on public.learning_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own records" on public.learning_records;
create policy "Delete own records" on public.learning_records for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_learning_record_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists learning_records_updated_at on public.learning_records;
create trigger learning_records_updated_at before update on public.learning_records
for each row execute function public.set_learning_record_updated_at();

commit;
