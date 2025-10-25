-- Fix AI dashboard by creating required tables
-- Run this in your Supabase SQL Editor

-- 1. Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
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

-- 2. Create AI campaign activities table
CREATE TABLE IF NOT EXISTS ai_campaign_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_activities_campaign_id ON ai_campaign_activities(campaign_id);

-- 4. Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_campaign_activities ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for campaigns
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;

CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for AI activities
DROP POLICY IF EXISTS "Users can view own AI activities" ON ai_campaign_activities;
DROP POLICY IF EXISTS "Users can insert own AI activities" ON ai_campaign_activities;

CREATE POLICY "Users can view own AI activities" ON ai_campaign_activities
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own AI activities" ON ai_campaign_activities
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );
