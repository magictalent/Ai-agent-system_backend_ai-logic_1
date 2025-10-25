-- Minimal clients table creation
-- Run this in your Supabase SQL editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  industry text,
  crm_provider text NOT NULL DEFAULT 'mock' CHECK (crm_provider IN ('hubspot', 'salesforce', 'pipedrive', 'mock')),
  crm_connected boolean DEFAULT false,
  google_connected boolean DEFAULT false,
  openai_personality text DEFAULT 'professional' CHECK (openai_personality IN ('friendly', 'professional', 'casual')),
  ai_status text DEFAULT 'idle' CHECK (ai_status IN ('idle', 'analyzing', 'communicating')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);
