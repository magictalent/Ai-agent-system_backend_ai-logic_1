-- Minimal table to store HubSpot OAuth tokens per user
create table if not exists hubspot_tokens (
  user_id uuid primary key,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_in integer,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

