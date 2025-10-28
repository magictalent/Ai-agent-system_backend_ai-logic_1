-- Stores per-client automation settings
DROP TABLE IF EXISTS client_automation CASCADE;
CREATE TABLE client_automation (
  client_id text PRIMARY KEY,
  enabled boolean DEFAULT true,
  paused boolean DEFAULT false,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_automation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage automation" ON client_automation
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

