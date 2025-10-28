-- Create a simple sequence queue table for scheduling outbound steps

-- 1) Drop if exists (for local setup convenience)
DROP TABLE IF EXISTS sequence_queue CASCADE;

-- 2) Create table
CREATE TABLE sequence_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  client_id text NOT NULL,
  lead_id text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email')),
  type text NOT NULL DEFAULT 'email' CHECK (type IN ('email','book')),
  subject text,
  content text NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','cancelled')),
  try_count int DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) RLS (optional): mirror campaigns ownership model if present
ALTER TABLE sequence_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queued steps" ON sequence_queue
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own queued steps" ON sequence_queue
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own queued steps" ON sequence_queue
  FOR UPDATE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

-- 4) Indexes
CREATE INDEX idx_sequence_queue_campaign ON sequence_queue(campaign_id);
CREATE INDEX idx_sequence_queue_lead ON sequence_queue(lead_id);
CREATE INDEX idx_sequence_queue_due ON sequence_queue(due_at);
CREATE INDEX idx_sequence_queue_status ON sequence_queue(status);
