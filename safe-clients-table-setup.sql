-- Safe clients table setup
-- This will work whether the table exists or not

-- Check if table exists and create if it doesn't
DO $$ 
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
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
        
        -- Create indexes
        CREATE INDEX idx_clients_user_id ON clients(user_id);
        CREATE INDEX idx_clients_crm_provider ON clients(crm_provider);
        CREATE INDEX idx_clients_ai_status ON clients(ai_status);
        
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
          
        RAISE NOTICE 'Clients table created successfully';
    ELSE
        RAISE NOTICE 'Clients table already exists';
    END IF;
END $$;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
