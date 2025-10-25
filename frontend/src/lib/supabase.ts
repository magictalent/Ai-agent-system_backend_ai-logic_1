import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug environment variables
console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET')
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'NOT SET')

// Validate environment variables
if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
  console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL')
  console.error('Current value:', supabaseUrl)
  console.error('Please set a valid Supabase URL in .env.local')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
  console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('Current value:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
  console.error('Please set a valid Supabase anon key in .env.local')
}

// Create mock client for invalid credentials
const createMockClient = () => ({
  auth: {
    signInWithPassword: () => Promise.resolve({ 
      data: null, 
      error: { message: 'Supabase not configured - check .env.local file' } 
    }),
    signUp: () => Promise.resolve({ 
      data: null, 
      error: { message: 'Supabase not configured - check .env.local file' } 
    }),
    getSession: () => Promise.resolve({ 
      data: { session: null }, 
      error: { message: 'Supabase not configured - check .env.local file' } 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
})

// Create Supabase client
let supabase: any

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your-project-id') || 
    supabaseAnonKey.includes('your-anon-key')) {
  console.error('❌ Cannot initialize Supabase client - invalid credentials')
  console.error('Please check your .env.local file and restart the development server')
  supabase = createMockClient()
} else {
  // Create real Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('✅ Supabase client initialized successfully')
  
  // Test the connection
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection test passed')
    }
  }).catch(err => {
    console.error('❌ Supabase connection error:', err)
  })
}

export { supabase }
