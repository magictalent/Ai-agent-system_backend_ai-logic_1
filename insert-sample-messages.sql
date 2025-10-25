-- Insert sample messages for your existing campaign
-- This will create messages for your campaign with 3 leads

-- First, let's get your campaign ID and create sample messages
INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id as campaign_id,
  'lead_001' as lead_id,
  'John Smith' as lead_name,
  'john.smith@example.com' as lead_email,
  '+1-555-0101' as lead_phone,
  'email' as channel,
  'Hi John, I hope this email finds you well. I wanted to reach out regarding our latest product offering that I believe could be of great value to your business. We have seen tremendous success with companies in your industry and would love to share some insights with you.' as content,
  'sent' as status,
  'outbound' as direction
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id as campaign_id,
  'lead_002' as lead_id,
  'Sarah Johnson' as lead_name,
  'sarah.johnson@example.com' as lead_email,
  '+1-555-0102' as lead_phone,
  'whatsapp' as channel,
  'Hello Sarah! 👋 I have an exciting opportunity to share with you. Our AI-powered sales automation has helped companies like yours increase their conversion rates by 40%. Would you be interested in a quick 15-minute demo?' as content,
  'delivered' as status,
  'outbound' as direction
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id as campaign_id,
  'lead_003' as lead_id,
  'Mike Davis' as lead_name,
  'mike.davis@example.com' as lead_email,
  '+1-555-0103' as lead_phone,
  'sms' as channel,
  'Hi Mike, quick question about your business needs. We specialize in AI sales automation and have helped companies in your sector increase their lead conversion by 35%. Interested in learning more?' as content,
  'read' as status,
  'outbound' as direction
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

-- Add some inbound responses
INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id as campaign_id,
  'lead_001' as lead_id,
  'John Smith' as lead_name,
  'john.smith@example.com' as lead_email,
  '+1-555-0101' as lead_phone,
  'email' as channel,
  'Thank you for reaching out. I am interested in learning more about your services. Can you send me more information about your pricing?' as content,
  'replied' as status,
  'inbound' as direction
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;

INSERT INTO messages (campaign_id, lead_id, lead_name, lead_email, lead_phone, channel, content, status, direction)
SELECT 
  c.id as campaign_id,
  'lead_002' as lead_id,
  'Sarah Johnson' as lead_name,
  'sarah.johnson@example.com' as lead_email,
  '+1-555-0102' as lead_phone,
  'whatsapp' as channel,
  'Thanks for the message! I would like to know more details. When would be a good time for a call?' as content,
  'replied' as status,
  'inbound' as direction
FROM campaigns c
WHERE c.user_id = auth.uid()
LIMIT 1;
