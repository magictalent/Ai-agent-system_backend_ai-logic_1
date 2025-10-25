-- Complete database setup for AI Sales Agents
-- Run this in your Supabase SQL editor

-- 1. Create clients table
DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  industry text,
  crm_provider text NOT NULL DEFAULT 'mock',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create campaigns table
DROP TABLE IF EXISTS campaigns CASCADE;

CREATE TABLE campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms', 'multi')),
  client_name text NOT NULL,
  leads_count integer DEFAULT 0,
  appointments_count integer DEFAULT 0,
  response_rate decimal(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz
);

-- 3. Create indexes for clients
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- 4. Create indexes for campaigns
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_channel ON campaigns(channel);

-- 5. Enable RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 6. Enable RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Insert test data (optional)
-- This will only work if you're logged in
INSERT INTO clients (user_id, name, email, industry, crm_provider) 
VALUES (
  auth.uid(), 
  'Test Client', 
  'test@example.com', 
  'Technology', 
  'mock'
);
