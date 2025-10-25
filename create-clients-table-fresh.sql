-- Create clients table from scratch
-- This will work even if the table doesn't exist or has issues

-- Drop the table if it exists (be careful - this will delete all data!)
DROP TABLE IF EXISTS clients CASCADE;

-- Create the clients table with all required columns
CREATE TABLE clients (
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

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_crm_provider ON clients(crm_provider);
CREATE INDEX idx_clients_ai_status ON clients(ai_status);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a test client (optional - remove if you don't want test data)
INSERT INTO clients (user_id, name, email, industry, crm_provider, openai_personality) 
VALUES (
  auth.uid(), 
  'Test Client', 
  'test@example.com', 
  'Technology', 
  'mock', 
  'professional'
);
