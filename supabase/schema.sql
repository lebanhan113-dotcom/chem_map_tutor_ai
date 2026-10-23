-- CHẠY TOÀN BỘ trong Supabase SQL Editor (một lần). Không đưa khóa service-role lên trình duyệt.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'student' check (role in ('teacher','student')),
  created_at timestamptz not null default now()
);
create or replace function public.new_user_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id,display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name','')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.new_user_profile();
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  grade int not null check (grade between 10 and 12),
  chapter text not null default '', lesson text not null default '',
  kind text not null default 'mcq' check (kind in ('mcq','true_false','tf4','short')),
  difficulty text not null default 'TH' check (difficulty in ('NB','TH','VD','VDC')),
  stem text not null,
  options jsonb not null default '{}'::jsonb,
  answer text not null,
  explanation text not null default '',
  source_title text not null default '', source_url text not null default '',
  nls_tags text[] not null default '{}',
  verified boolean not null default false,
  practice_enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  title text not null, grade int not null check (grade between 10 and 12),
  chapter text not null default '', lesson text not null default '',
  exam_kind text not null default 'thuong_xuyen' check (exam_kind in ('theo_bai','theo_chuong','thuong_xuyen','giua_ki_1','giua_ki_2')),
  question_ids uuid[] not null default '{}',
  option_orders jsonb not null default '{}'::jsonb,
  variant_group text not null default '',
  variant_number int not null default 1,
  duration_minutes int not null default 30 check(duration_minutes between 5 and 180),
  share_code text not null unique,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  answers jsonb not null default '{}'::jsonb,
  details jsonb not null default '[]'::jsonb,
  score numeric(4,2) not null,
  submitted_at timestamptz not null default now(),
  unique(test_id,student_id)
);
create table if not exists public.test_sessions (
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (test_id,student_id)
);
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_account_time on public.ai_usage(account_id,requested_at desc);
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  account_id uuid references public.profiles(id),
  visitor_id text not null,
  page text not null default '/',
  visited_at timestamptz not null default now()
);
create index if not exists idx_visits_date on public.visits(visited_at desc);
create index if not exists idx_visits_visitor on public.visits(visitor_id);
create index if not exists idx_bank_grade on public.question_bank(grade,chapter,lesson);
create index if not exists idx_attempts_test on public.attempts(test_id);
-- Khóa đọc trực tiếp: API server thực hiện phân quyền và không lộ đáp án đề chưa nộp.
alter table public.profiles enable row level security;
alter table public.question_bank enable row level security;
alter table public.tests enable row level security;
alter table public.attempts enable row level security;
alter table public.test_sessions enable row level security;
alter table public.visits enable row level security;
alter table public.ai_usage enable row level security;
drop policy if exists profile_self_read on public.profiles;
create policy profile_self_read on public.profiles for select to authenticated using (id=auth.uid());
-- Quan trọng: KHÔNG tạo policy ghi role từ client; giáo viên được cấp vai trò thủ công trong SQL Editor.
-- Các bảng còn lại không có policy: mọi thao tác qua API Next.js xác minh token và quyền.
-- Sau khi đăng ký tài khoản, chỉ định giáo viên bằng lệnh sau (đổi email):
-- UPDATE public.profiles SET role='teacher' WHERE id=(SELECT id FROM auth.users WHERE email='teacher@example.edu.vn');

-- Hàm tổng hợp trên cơ sở dữ liệu: không bị giới hạn 1.000 hàng của API.
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

create or replace function public.eduplan_teacher_attempt_stats(p_teacher uuid)
returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object(
  'attempts',count(a.id),
  'unique_students',count(distinct a.student_id),
  'mean_score',round(avg(a.score)::numeric,2)
 )
 from public.tests t left join public.attempts a on a.test_id=t.id
 where t.owner_id=p_teacher;
$$;
revoke all on function public.eduplan_teacher_attempt_stats(uuid) from public,anon,authenticated;
grant execute on function public.eduplan_teacher_attempt_stats(uuid) to service_role;
