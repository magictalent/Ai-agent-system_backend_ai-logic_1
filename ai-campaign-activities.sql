-- Create AI campaign activities table
-- Run this in your Supabase SQL Editor

-- Create table for tracking AI activities
CREATE TABLE IF NOT EXISTS ai_campaign_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_ai_activities_campaign_id ON ai_campaign_activities(campaign_id);
CREATE INDEX idx_ai_activities_type ON ai_campaign_activities(activity_type);
CREATE INDEX idx_ai_activities_created_at ON ai_campaign_activities(created_at);

-- Enable RLS
ALTER TABLE ai_campaign_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
