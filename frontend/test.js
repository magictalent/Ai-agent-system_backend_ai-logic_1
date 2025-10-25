// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('=== Supabase Environment Variables Test ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Check if variables are loaded
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n=== Status Check ===');
console.log('URL loaded:', !!url);
console.log('Key loaded:', !!key);
console.log('URL value:', url ? `${url.substring(0, 20)}...` : 'NOT SET');
console.log('Key value:', key ? `${key.substring(0, 20)}...` : 'NOT SET');

if (!url || !key) {
  console.log('\n❌ Missing environment variables!');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env.local file in the frontend directory');
  console.log('2. Add your Supabase credentials:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('');
  console.log('3. Get these values from your Supabase project dashboard:');
  console.log('   Settings > API > Project URL and anon public key');
  console.log('');
  console.log('4. Run this test again: node test.js');
} else {
  console.log('\n✅ Environment variables loaded successfully!');
  console.log('Your Supabase configuration is working!');
}