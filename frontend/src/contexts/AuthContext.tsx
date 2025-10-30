'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js' // Import Session type

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name?: string // Added optional name property
  role: string
  organization: {
    id: string
    name: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setToken(session.access_token)
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name || '',
          lastName: session.user.user_metadata?.last_name || '',
          name: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || undefined,
          role: session.user.role || 'user',
          organization: {
            id: session.user.user_metadata?.organization_id || '',
            name: session.user.user_metadata?.company_name || '',
          }
        })
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (session) {
          setToken(session.access_token)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            name: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || undefined,
            role: session.user.role || 'user',
            organization: {
              id: session.user.user_metadata?.organization_id || '',
              name: session.user.user_metadata?.company_name || '',
            }
          })
        } else {
          setToken(null)
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    console.log('🔐 Login response:', { data, error })

    if (error) {
      console.error('❌ Login error:', error)
      throw new Error(error.message)
    }

    if (data.session && data.user) {
      console.log('✅ Login successful:', data.user.email)
      setToken(data.session.access_token)
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || '',
        name: `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim() || undefined,
        role: data.user.role || 'user',
        organization: {
          id: data.user.user_metadata?.organization_id || '',
          name: data.user.user_metadata?.company_name || '',
        }
      })
    } else {
      throw new Error('No session created')
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}