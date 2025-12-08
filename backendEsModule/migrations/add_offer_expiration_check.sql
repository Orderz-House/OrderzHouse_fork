-- Migration script to ensure offers table has proper structure for 24-hour expiration rule

-- Add updated_at column if it doesn't exist
ALTER TABLE offers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Ensure the offer_status column has the 'expired' value in its enum
-- Note: PostgreSQL doesn't allow direct modification of ENUM types in migrations,
-- so this would typically be handled during database setup.

-- Create an index on created_at for better performance of expiration queries
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers (created_at);

-- Create an index on offer_status for better performance of status queries
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers (offer_status);

-- Update any existing pending offers that are older than 24 hours to expired
UPDATE offers 
SET offer_status = 'expired', updated_at = NOW()
WHERE offer_status = 'pending' 
  AND created_at < NOW() - INTERVAL '24 hours';