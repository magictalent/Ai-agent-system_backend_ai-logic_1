-- Add preferred channel to client_automation
ALTER TABLE client_automation
  ADD COLUMN IF NOT EXISTS preferred_channel text DEFAULT 'email' CHECK (preferred_channel IN ('email','sms','whatsapp'));

