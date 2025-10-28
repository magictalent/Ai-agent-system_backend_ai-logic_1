-- Minimal leads table required by the app
create table if not exists leads (
  id text primary key,
  email text,
  first_name text,
  last_name text,
  phone text,
  status text default 'new',
  last_contacted timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: index by email to speed lookups
create index if not exists idx_leads_email on leads (email);

