-- Migration: Add referral_code to users and create referrals/referral_rewards tables
-- Run this migration if the JS migration doesn't work or for direct SQL execution

BEGIN;

-- Add referral_code column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_referral_code_key'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP NULL,
  UNIQUE(referred_user_id)
);

-- Create indexes on referrals for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id INT NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  type VARCHAR(20) DEFAULT 'referral',
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes on referral_rewards
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral ON public.referral_rewards(referral_id);

-- Generate referral codes for existing users (if they don't have one)
UPDATE public.users 
SET referral_code = UPPER(
  SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT || NOW()::TEXT), 1, 7)
)
WHERE referral_code IS NULL;

COMMIT;
