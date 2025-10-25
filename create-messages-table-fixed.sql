-- Fixed messages table creation script
-- This script creates the messages table with proper structure

-- 1. Drop existing table if it exists
DROP TABLE IF EXISTS messages CASCADE;

-- 2. Create messages table
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  lead_id text NOT NULL,
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

-- 3. Add foreign key constraint (only if campaigns table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    ALTER TABLE messages ADD CONSTRAINT fk_messages_campaign_id 
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
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

-- 6. Create indexes for better performance
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_status ON messages(status);

-- 7. Insert sample messages for testing (only if campaigns exist)
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
    WHEN (floor(random() * 2)::int = 0) THEN 
      CASE 
        WHEN (CASE floor(random() * 3)::int WHEN 0 THEN 'email' WHEN 1 THEN 'whatsapp' ELSE 'sms' END) = 'email' 
        THEN 'Hi John, I hope this email finds you well. I wanted to reach out regarding our latest product offering.'
        WHEN (CASE floor(random() * 3)::int WHEN 0 THEN 'email' WHEN 1 THEN 'whatsapp' ELSE 'sms' END) = 'whatsapp' 
        THEN 'Hello John! 👋 I have an exciting opportunity to share with you.'
        ELSE 'Hi John, quick question about your business needs.'
      END
    ELSE 
      CASE 
        WHEN (CASE floor(random() * 3)::int WHEN 0 THEN 'email' WHEN 1 THEN 'whatsapp' ELSE 'sms' END) = 'email' 
        THEN 'Thank you for reaching out. I am interested in learning more about your services.'
        WHEN (CASE floor(random() * 3)::int WHEN 0 THEN 'email' WHEN 1 THEN 'whatsapp' ELSE 'sms' END) = 'whatsapp' 
        THEN 'Thanks for the message! I would like to know more details.'
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
CROSS JOIN generate_series(1, 3) as msg_count
WHERE c.user_id = auth.uid()
ON CONFLICT (id) DO NOTHING;
