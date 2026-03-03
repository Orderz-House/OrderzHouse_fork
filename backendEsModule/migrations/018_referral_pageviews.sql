-- Referral pageviews: every landing with ref/utm (total visits).
-- referral_visits = one row per session (unique visits). referral_pageviews = every hit (total page visits).
-- Run: psql -d your_database -f 018_referral_pageviews.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.referral_pageviews (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  ref TEXT,
  session_id TEXT NOT NULL,
  landing_path TEXT,
  user_agent TEXT,
  ip INET,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_pageviews_source_created_at
  ON public.referral_pageviews (source, created_at);
CREATE INDEX IF NOT EXISTS idx_referral_pageviews_session_created_at
  ON public.referral_pageviews (session_id, created_at);

COMMIT;
