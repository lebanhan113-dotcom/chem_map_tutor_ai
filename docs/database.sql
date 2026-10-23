-- Run in Supabase SQL Editor. Counts pseudonymous browser sessions, not named users.
CREATE TABLE IF NOT EXISTS public.eduplan_visits (
  id bigint generated always as identity primary key,
  visit_day date NOT NULL,
  visitor_hash text NOT NULL CHECK (char_length(visitor_hash)=64),
  session_hash text NOT NULL CHECK (char_length(session_hash)=64),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visit_day, session_hash)
);
CREATE INDEX IF NOT EXISTS eduplan_visits_by_day ON public.eduplan_visits (visit_day);
ALTER TABLE public.eduplan_visits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.eduplan_visits FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.eduplan_visit_stats() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object(
   'sessions', (SELECT count(*) FROM eduplan_visits),
   'visitors', (SELECT count(DISTINCT visitor_hash) FROM eduplan_visits),
   'daily', COALESCE((SELECT jsonb_agg(row_to_json(t) ORDER BY t.day DESC) FROM (
     SELECT visit_day::text AS day, count(*) AS sessions, count(DISTINCT visitor_hash) AS visitors
     FROM eduplan_visits GROUP BY visit_day ORDER BY visit_day DESC LIMIT 90
   ) t),'[]'::jsonb)
 )
$$;
REVOKE ALL ON FUNCTION public.eduplan_visit_stats() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.eduplan_visit_stats() TO service_role;
-- Use only server-side service-role key in Vercel environment variables.
