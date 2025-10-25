-- Quick fix for clients table
-- Run this in Supabase SQL Editor

-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- If the table doesn't exist or has issues, recreate it
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

-- Create index
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Test the table by inserting a sample record (this will only work if you're logged in)
-- INSERT INTO clients (user_id, name, email, industry, crm_provider) 
-- VALUES (auth.uid(), 'Test Client', 'test@example.com', 'Technology', 'mock');
