-- Add do_not_contact flag and supporting indexes to leads

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS do_not_contact boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_contacted timestamptz;

-- Optional: backfill from status if present
UPDATE leads SET do_not_contact = true
WHERE NOT do_not_contact AND lower(coalesce(status, '')) = 'unsubscribed';

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_leads_dnc ON leads(do_not_contact);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

