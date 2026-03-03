-- Partner referral: list of partners (dropdown in admin)
-- Run with: psql -d your_database -f 016_referral_partners.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.referral_partners (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_partners_code ON public.referral_partners (code);
CREATE INDEX IF NOT EXISTS idx_referral_partners_is_active ON public.referral_partners (is_active);

INSERT INTO public.referral_partners (code, name)
VALUES ('efe', 'EFE')
ON CONFLICT (code) DO NOTHING;

COMMIT;
