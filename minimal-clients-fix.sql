-- Minimal clients table fix
-- This creates only the essential columns needed

-- Drop existing table if it exists
DROP TABLE IF EXISTS clients CASCADE;

-- Create minimal clients table
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

-- Create policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);
