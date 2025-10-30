'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js' // Import Session type

export default function DebugAuthPage() {
  const { user, token, isLoading } = useAuth()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Check Supabase session directly
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSupabaseSession(session)
    })

    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'testuser123@gmail.com',
        password: 'testpassword123',
      })
      console.log('Login test result:', { data, error })
      if (error) {
        alert(`Login failed: ${error.message}\n\nThis is expected if the email hasn't been verified yet.`)
      } else if (data.session) {
        alert('Login successful!')
      }
    } catch (err: unknown) {
      console.error('Login test error:', err)
      alert(`Login error: ${(err as Error).message}`)
    }
  }

  const createTestUser = async () => {
    try {
      const testEmail = `testuser${Date.now()}@gmail.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            company_name: 'Test Company'
          }
        }
      })
      console.log('User creation result:', { data, error })
      if (data.user) {
        alert(`Test user created with email: ${testEmail}\n\nNote: You need to verify the email before logging in.\nCheck your email for verification link.`)
      } else if (error) {
        alert(`Error: ${error.message}`)
      }
    } catch (err: unknown) {
      console.error('User creation error:', err)
      alert(`Error: ${(err as Error).message}`)
    }
  }

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log('Connection test result:', { data, error })
    } catch (err) {
      console.error('Connection test error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AuthContext Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AuthContext Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
              <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
            </div>
          </div>

          {/* Supabase Session */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Supabase Session</h2>
            <div className="space-y-2">
              <p><strong>Session:</strong> {supabaseSession ? 'Active' : 'No session'}</p>
              {supabaseSession && (
                <>
                  <p><strong>User ID:</strong> {supabaseSession.user?.id}</p>
                  <p><strong>Email:</strong> {supabaseSession.user?.email}</p>
                  <p><strong>Access Token:</strong> {supabaseSession.access_token?.substring(0, 20)}...</p>
                </>
              )}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <p><strong>URL:</strong> {envVars.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
              <p><strong>Key:</strong> {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-2">
              <button
                onClick={testConnection}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
              >
                Test Connection
              </button>
              <button
                onClick={createTestUser}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2"
              >
                Create Test User
              </button>
              <button
                onClick={testLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Login
              </button>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="mt-8 bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          <h3 className="text-white mb-2">Console Output:</h3>
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
}
