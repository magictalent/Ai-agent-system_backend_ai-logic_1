-- Create clients table in Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- Supabase Auth user link
  name text NOT NULL,                -- Company or person name
  email text UNIQUE NOT NULL,        -- Main business email
  phone text,                        -- Optional
  industry text,                     -- AI personalization context
  crm_provider text NOT NULL CHECK (crm_provider IN ('hubspot', 'salesforce', 'pipedrive', 'mock')), -- CRM provider
  crm_connected boolean DEFAULT false,
  google_connected boolean DEFAULT false,
  openai_personality text DEFAULT 'professional' CHECK (openai_personality IN ('friendly', 'professional', 'casual')), -- AI personality
  ai_status text DEFAULT 'idle' CHECK (ai_status IN ('idle', 'analyzing', 'communicating')), -- AI status
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_crm_provider ON clients(crm_provider);
CREATE INDEX IF NOT EXISTS idx_clients_ai_status ON clients(ai_status);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert clients for themselves
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own clients
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own clients
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
