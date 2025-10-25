'use client'

import { useEffect, useState } from 'react'

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Test environment variables
    const testVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
    
    setEnvVars(testVars)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Configuration</h2>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_URL</h3>
              <p className="text-sm text-gray-600 mt-1">
                {envVars.NEXT_PUBLIC_SUPABASE_URL ? (
                  <span className="text-green-600">
                    ✅ Loaded: {envVars.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...
                  </span>
                ) : (
                  <span className="text-red-600">❌ Not set</span>
                )}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
              <p className="text-sm text-gray-600 mt-1">
                {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <span className="text-green-600">
                    ✅ Loaded: {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...
                  </span>
                ) : (
                  <span className="text-red-600">❌ Not set</span>
                )}
              </p>
            </div>
          </div>

          {!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800">Setup Required</h4>
              <p className="text-sm text-red-700 mt-2">
                Create a <code>.env.local</code> file in the frontend directory with:
              </p>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">✅ Configuration Complete</h4>
              <p className="text-sm text-green-700 mt-2">
                Environment variables are properly loaded!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
