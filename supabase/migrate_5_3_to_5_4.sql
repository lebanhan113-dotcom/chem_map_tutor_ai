alter table public.question_bank drop constraint if exists question_bank_kind_check;
alter table public.question_bank add constraint question_bank_kind_check check (kind in ('mcq','true_false','tf4','short'));
-- Migrate an EXISTING 5.3 database to 5.4. Run in Supabase SQL Editor.
-- Do not run this migration on a fresh database: use schema.sql instead.
alter table public.question_bank add column if not exists practice_enabled boolean not null default false;
alter table public.tests add column if not exists option_orders jsonb not null default '{}'::jsonb;
alter table public.tests add column if not exists variant_group text not null default '';
alter table public.tests add column if not exists variant_number integer not null default 1;
create table if not exists public.test_sessions (
 test_id uuid not null references public.tests(id) on delete cascade,
 student_id uuid not null references public.profiles(id) on delete cascade,
 started_at timestamptz not null default now(),
 expires_at timestamptz not null,
 primary key (test_id,student_id)
);
alter table public.test_sessions enable row level security;
create or replace function public.eduplan_visit_stats()
returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object(
  'total_visits', (select count(*) from public.visits),
  'unique_browser_ids', (select count(distinct visitor_id) from public.visits),
  'today_visits', (select count(*) from public.visits where (visited_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date),
  'registered_accounts', (select count(*) from public.profiles),
  'signed_in_visits', (select count(*) from public.visits where account_id is not null),
  'daily', (select coalesce(jsonb_agg(jsonb_build_array(dy,ct) order by dy),'[]'::jsonb) from (
    select (visited_at at time zone 'Asia/Ho_Chi_Minh')::date::text dy, count(*) ct
    from public.visits group by 1 order by 1 desc limit 14
  ) v)
 );
$$;
revoke all on function public.eduplan_visit_stats() from public,anon,authenticated;
grant execute on function public.eduplan_visit_stats() to service_role;
