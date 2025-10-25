-- Create messages table for AI-lead conversations
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id text NOT NULL, -- External lead ID from CRM
  lead_name text NOT NULL,
  lead_email text NOT NULL,
  lead_phone text,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  content text NOT NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'replied', 'failed')),
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Insert sample messages for testing
INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id,
  'lead_' || floor(random() * 1000)::int,
  'John Doe ' || floor(random() * 100)::int,
  'john.doe' || floor(random() * 100)::int || '@example.com',
  '+1-555-' || floor(random() * 10000)::int,
  CASE floor(random() * 3)::int
    WHEN 0 THEN 'email'
    WHEN 1 THEN 'whatsapp'
    ELSE 'sms'
  END,
  CASE 
    WHEN direction = 'outbound' THEN 
      CASE channel
        WHEN 'email' THEN 'Hi ' || lead_name || ', I hope this email finds you well. I wanted to reach out regarding our latest product offering that I believe could be of great value to your business.'
        WHEN 'whatsapp' THEN 'Hello ' || lead_name || '! 👋 I have an exciting opportunity to share with you.'
        ELSE 'Hi ' || lead_name || ', quick question about your business needs.'
      END
    ELSE 
      CASE channel
        WHEN 'email' THEN 'Thank you for reaching out. I am interested in learning more about your services.'
        WHEN 'whatsapp' THEN 'Thanks for the message! I would like to know more details.'
        ELSE 'Interested in your offer. Please send more info.'
      END
  END,
  CASE floor(random() * 4)::int
    WHEN 0 THEN 'sent'
    WHEN 1 THEN 'delivered'
    WHEN 2 THEN 'read'
    ELSE 'replied'
  END,
  CASE floor(random() * 2)::int
    WHEN 0 THEN 'outbound'
    ELSE 'inbound'
  END
FROM campaigns c
CROSS JOIN generate_series(1, 5) as msg_count
WHERE c.user_id = auth.uid()
ON CONFLICT (id) DO NOTHING;
