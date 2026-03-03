-- Idempotent visit logging: one row per (source, session_id)
-- Run: psql -d your_database -f 017_referral_visits_unique_source_session.sql
-- Safe to run multiple times (skips adding constraint if it already exists).

BEGIN;

-- Remove duplicate (source, session_id) rows, keeping the earliest created_at
DELETE FROM referral_visits a
USING referral_visits b
WHERE a.source = b.source AND a.session_id = b.session_id AND a.id > b.id;

-- Add unique constraint only if missing (so INSERT ... ON CONFLICT DO NOTHING works)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'referral_visits_source_session_unique'
  ) THEN
    ALTER TABLE referral_visits
      ADD CONSTRAINT referral_visits_source_session_unique UNIQUE (source, session_id);
  END IF;
END $$;

COMMIT;
