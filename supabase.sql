-- EduPlan AI 5.6 - Run in Supabase Dashboard > SQL Editor.
-- Public exam links are for FORMATIVE PRACTICE ONLY, not secure high-stakes assessment.
-- Anonymous clients cannot directly read identities or individual submissions.

create table if not exists public.edp_visitors (
  visitor_key text primary key,
  visits integer not null default 1 check (visits > 0),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create table if not exists public.edp_participants (
  student_key text primary key,
  first_seen timestamptz not null default now()
);
create table if not exists public.edp_exam_starts (
  student_key text not null references public.edp_participants(student_key),
  exam_ref text not null,
  grade smallint not null check (grade in (10,11,12)),
  started_at timestamptz not null default now(),
  primary key (student_key, exam_ref)
);
create table if not exists public.edp_attempts (
  id uuid primary key,
  student_key text not null references public.edp_participants(student_key),
  exam_ref text not null,
  student_code text not null default '',
  class_code text not null default '',
  exam_title text not null default '',
  grade smallint not null check (grade in (10,11,12)),
  score numeric(4,2) not null check (score between 0 and 10),
  submitted_at timestamptz not null default now()
);
create table if not exists public.published_exams (
  id uuid primary key,
  owner uuid not null default auth.uid() references auth.users(id),
  title text not null,
  grade smallint not null check (grade in (10,11,12)),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists edp_attempts_submitted_at on public.edp_attempts(submitted_at desc);
create index if not exists published_exams_owner on public.published_exams(owner);

alter table public.edp_visitors enable row level security;
alter table public.edp_participants enable row level security;
alter table public.edp_attempts enable row level security;
alter table public.edp_exam_starts enable row level security;
alter table public.published_exams enable row level security;

-- Explicitly grant only read access to public FORMATIVE exams.
revoke all on public.edp_visitors,public.edp_participants,public.edp_attempts,public.edp_exam_starts from anon,authenticated;
grant select on public.edp_attempts to authenticated;
drop policy if exists "Authenticated teachers can read submitted practice scores" on public.edp_attempts;
create policy "Authenticated teachers can read submitted practice scores" on public.edp_attempts
  for select to authenticated using (true);
grant select on public.published_exams to anon,authenticated;
grant insert,update,delete on public.published_exams to authenticated;
drop policy if exists "Public can read published practice tests" on public.published_exams;
create policy "Public can read published practice tests" on public.published_exams
  for select to anon,authenticated using (true);
drop policy if exists "Authenticated teachers can publish their practice tests" on public.published_exams;
create policy "Authenticated teachers can publish their practice tests" on public.published_exams
  for insert to authenticated with check (auth.uid()=owner);
drop policy if exists "Only owner can update practice tests" on public.published_exams;
create policy "Only owner can update practice tests" on public.published_exams
  for update to authenticated using (auth.uid()=owner) with check (auth.uid()=owner);
drop policy if exists "Only owner can delete practice tests" on public.published_exams;
create policy "Only owner can delete practice tests" on public.published_exams
  for delete to authenticated using (auth.uid()=owner);

create or replace function public.edp_register_visit(p_visitor_key text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_visitor_key is null or length(p_visitor_key) < 12 or length(p_visitor_key) > 96 then
    raise exception 'Invalid visitor key';
  end if;
  insert into public.edp_visitors(visitor_key, visits)
  values(p_visitor_key,1)
  on conflict (visitor_key) do update
    set visits=public.edp_visitors.visits+1,last_seen=now();
end $$;

create or replace function public.edp_register_start(p_student_key text,p_exam_ref text,p_grade integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_student_key is null or length(p_student_key) <> 64 or
     p_student_key !~ '^[a-f0-9]{64}$' or
     p_exam_ref is null or length(p_exam_ref)>120 or p_grade not in (10,11,12) then
    raise exception 'Invalid start';
  end if;
  insert into public.edp_participants(student_key) values(p_student_key)
  on conflict (student_key) do nothing;
  insert into public.edp_exam_starts(student_key,exam_ref,grade) values(p_student_key,p_exam_ref,p_grade)
  on conflict (student_key,exam_ref) do nothing;
end $$;

create or replace function public.edp_submit_attempt(
  p_attempt_id uuid, p_student_key text, p_exam_ref text, p_grade integer, p_score numeric,
  p_student_code text, p_class_code text, p_exam_title text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_student_key is null or length(p_student_key) <> 64 or
     p_student_key !~ '^[a-f0-9]{64}$' or length(p_exam_ref)>120 or
     p_grade not in (10,11,12) or p_score<0 or p_score>10 or
     length(p_student_code)>50 or length(p_class_code)>30 or length(p_exam_title)>200 then
    raise exception 'Invalid submission';
  end if;
  insert into public.edp_participants(student_key) values (p_student_key)
  on conflict (student_key) do nothing;
  insert into public.edp_exam_starts(student_key,exam_ref,grade) values(p_student_key,p_exam_ref,p_grade)
  on conflict (student_key,exam_ref) do nothing;
  insert into public.edp_attempts(id,student_key,exam_ref,grade,score,student_code,class_code,exam_title)
  values(p_attempt_id,p_student_key,p_exam_ref,p_grade,p_score,p_student_code,p_class_code,p_exam_title)
  on conflict (id) do nothing;
end $$;

create or replace function public.edp_public_stats()
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
   'visits',(select coalesce(sum(visits),0) from public.edp_visitors),
   'visitors',(select count(*) from public.edp_visitors),
   'participants',(select count(*) from public.edp_participants),
   'starts',(select count(*) from public.edp_exam_starts),
   'submissions',(select count(*) from public.edp_attempts),
   'average_score',(select coalesce(round(avg(score),2),0) from public.edp_attempts)
  );
$$;

revoke all on function public.edp_register_visit(text) from public;
revoke all on function public.edp_register_start(text,text,integer) from public;
revoke all on function public.edp_submit_attempt(uuid,text,text,integer,numeric,text,text,text) from public;
revoke all on function public.edp_public_stats() from public;
grant execute on function public.edp_register_visit(text) to anon,authenticated;
grant execute on function public.edp_register_start(text,text,integer) to anon,authenticated;
grant execute on function public.edp_submit_attempt(uuid,text,text,integer,numeric,text,text,text) to anon,authenticated;
grant execute on function public.edp_public_stats() to anon,authenticated;

-- School deployment recommendations:
-- 1. Limit Supabase Auth sign-up to teachers (invite-only in project settings).
-- 2. Add CAPTCHA, rate limits and abuse monitoring for anonymous RPCs.
-- 3. Use server-side scoring and a protected question bank for formal exams.
-- 4. Avoid entering student personal data or authentication passwords into AI prompts.
