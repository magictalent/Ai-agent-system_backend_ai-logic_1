// HubSpot API test script with Supabase auth login support
//
// Usage examples:
//   node backend/test-hubspot.js --token <SUPABASE_JWT> status
//   node backend/test-hubspot.js --email you@example.com --password secret leads
//   node backend/test-hubspot.js --email you@example.com --password secret import
//   node backend/test-hubspot.js <SUPABASE_JWT> leads   (legacy positional)

const dotenv = require('dotenv');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: './backend/.env' });

const BASE = process.env.API_BASE || 'http://localhost:3001';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--token') out.token = argv[++i];
    else if (a === '--email') out.email = argv[++i];
    else if (a === '--password') out.password = argv[++i];
    else if (a === '--cmd') out.cmd = argv[++i];
    else out._.push(a);
  }
  return out;
}

const args = parseArgs(process.argv);
const CMD = (args.cmd || args._[1] || 'status').toLowerCase();

async function resolveSupabaseToken() {
  if (args.token) return args.token;
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  if (args._ && args._[0] && !args._[0].includes('@')) return args._[0];

  const email = args.email || process.env.SUPABASE_EMAIL;
  const password = args.password || process.env.SUPABASE_PASSWORD;
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!email || !password) {
    throw new Error('Provide --email and --password, or pass --token.');
  }
  if (!url || !anon) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in env.');
  }

  const sb = createClient(url, anon);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Supabase login failed: ${error.message}`);
  const t = data && data.session && data.session.access_token;
  if (!t) throw new Error('Supabase login returned no access token.');
  return t;
}

async function run() {
  try {
    const TOKEN = await resolveSupabaseToken();
    const headers = { Authorization: `Bearer ${TOKEN}` };

    if (CMD === 'status') {
      const { data } = await axios.get(`${BASE}/hubspot/auth/status`, { headers });
      console.log('hubspot/status ->', data);
      return;
    }

    if (CMD === 'whoami') {
      const { data } = await axios.get(`${BASE}/hubspot/auth/whoami`, { headers });
      console.log('hubspot/whoami ->', data);
      return;
    }

    if (CMD === 'url') {
      const { data } = await axios.get(`${BASE}/hubspot/auth/url`, { headers });
      console.log('hubspot/url ->', data);
      return;
    }

    if (CMD === 'test') {
      const { data } = await axios.get(`${BASE}/crm/test?provider=hubspot`, { headers });
      console.log('crm/test ->', data);
      return;
    }

    if (CMD === 'leads') {
      const { data } = await axios.get(`${BASE}/crm/leads?provider=hubspot&archived=1&includeSamples=1`, { headers });
      console.log(`crm/leads -> ${Array.isArray(data) ? data.length : 0} items`);
      if (Array.isArray(data)) console.log(data.slice(0, 5));
      return;
    }

    if (CMD === 'import') {
      const { data } = await axios.post(`${BASE}/crm/import?provider=hubspot&archived=1&includeSamples=1`, {}, { headers });
      console.log('crm/import ->', data);
      return;
    }

    console.log('Unknown command. Use one of: status | whoami | url | test | leads | import');
  } catch (e) {
    if (e.response) {
      console.error('HTTP error:', e.response.status, e.response.data);
    } else {
      console.error('Error:', e.message);
    }
    process.exit(1);
  }
}

run();
