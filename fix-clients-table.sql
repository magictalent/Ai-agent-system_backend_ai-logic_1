-- Fix clients table - Add missing columns if they don't exist
-- Run this in your Supabase SQL editor

-- Add ai_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'ai_status') THEN
        ALTER TABLE clients ADD COLUMN ai_status text DEFAULT 'idle' CHECK (ai_status IN ('idle', 'analyzing', 'communicating'));
    END IF;
END $$;

-- Add openai_personality column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'openai_personality') THEN
        ALTER TABLE clients ADD COLUMN openai_personality text DEFAULT 'professional' CHECK (openai_personality IN ('friendly', 'professional', 'casual'));
    END IF;
END $$;

-- Add crm_connected column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'crm_connected') THEN
        ALTER TABLE clients ADD COLUMN crm_connected boolean DEFAULT false;
    END IF;
END $$;

-- Add google_connected column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'google_connected') THEN
        ALTER TABLE clients ADD COLUMN google_connected boolean DEFAULT false;
    END IF;
END $$;

-- Add industry column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'industry') THEN
        ALTER TABLE clients ADD COLUMN industry text;
    END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'phone') THEN
        ALTER TABLE clients ADD COLUMN phone text;
    END IF;
END $$;

-- Add crm_provider column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'crm_provider') THEN
        ALTER TABLE clients ADD COLUMN crm_provider text NOT NULL DEFAULT 'mock' CHECK (crm_provider IN ('hubspot', 'salesforce', 'pipedrive', 'mock'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_crm_provider ON clients(crm_provider);
CREATE INDEX IF NOT EXISTS idx_clients_ai_status ON clients(ai_status);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Create RLS policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

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
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
