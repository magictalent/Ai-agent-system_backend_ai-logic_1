-- Simple message insertion - no policies needed
-- This will insert messages directly into your campaign

-- First, let's see your campaigns
SELECT id, name, user_id FROM campaigns WHERE user_id = auth.uid();

-- Insert messages with a simple approach
INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id,
  'lead_001',
  'John Smith',
  'john.smith@example.com',
  '+1-555-0101',
  'email',
  'Hi John, I hope this email finds you well. I wanted to reach out regarding our latest product offering.',
  'sent',
  'outbound'
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id,
  'lead_002',
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+1-555-0102',
  'whatsapp',
  'Hello Sarah! 👋 I have an exciting opportunity to share with you.',
  'delivered',
  'outbound'
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id,
  'lead_003',
  'Mike Davis',
  'mike.davis@example.com',
  '+1-555-0103',
  'sms',
  'Hi Mike, quick question about your business needs.',
  'read',
  'outbound'
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

-- Check if messages were inserted
SELECT * FROM messages;
