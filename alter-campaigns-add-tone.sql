-- Adds tone column to campaigns table if not exists
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS tone text DEFAULT 'friendly' CHECK (tone IN ('friendly','professional','casual'));

-- Backfill nulls to default
UPDATE campaigns SET tone = 'friendly' WHERE tone IS NULL;

