-- Partner referral tracking: visits + signup attribution
-- Run with: psql -d your_database -f 015_partner_referral_tracking.sql

BEGIN;

-- A) referral_visits table
CREATE TABLE IF NOT EXISTS public.referral_visits (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  ref TEXT,
  session_id TEXT NOT NULL,
  landing_path TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_visits_source_created_at
  ON public.referral_visits (source, created_at);
CREATE INDEX IF NOT EXISTS idx_referral_visits_session_id
  ON public.referral_visits (session_id);

-- B) Add signup attribution columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_source TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_medium TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_campaign TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_ref TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_landing_path TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS signup_attributed_at TIMESTAMP;

COMMIT;
