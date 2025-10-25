// Test Supabase connection directly
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  try {
    console.log('\n🧪 Testing Supabase connection...');
    
    // Test 1: Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session test:', sessionError ? `❌ ${sessionError.message}` : '✅ Success');
    
    // Test 2: Try to create a test user
    console.log('\n🧪 Testing user creation...');
    const testEmail = 'testuser123@gmail.com';
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('SignUp test:', `❌ ${signUpError.message}`);
    } else {
      console.log('SignUp test:', '✅ Success - User created');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    }
    
    // Test 3: Try to sign in (only if user was created)
    if (!signUpError) {
      console.log('\n🧪 Testing user login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.log('SignIn test:', `❌ ${signInError.message}`);
      } else {
        console.log('SignIn test:', '✅ Success - User logged in');
        console.log('Session token:', signInData.session?.access_token ? 'Present' : 'Missing');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabase();
