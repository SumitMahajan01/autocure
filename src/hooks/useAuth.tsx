import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient, type User, type Session } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a mock client if credentials are missing (for development/testing)
const createMockClient = () => {
  console.warn('Supabase credentials not configured. Using mock client.')
  return {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve(),
      resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    }),
    rpc: () => Promise.resolve({ data: false }),
  } as unknown as ReturnType<typeof createClient>
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient()

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state change listener FIRST (before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      }
    )

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ error: Error | null }> => {
    try {
      // Validate inputs
      if (!email?.trim()) {
        return { error: new Error('Email is required') }
      }
      if (!password || password.length < 6) {
        return { error: new Error('Password must be at least 6 characters') }
      }
      if (!supabaseUrl || !supabaseKey) {
        return { error: new Error('Supabase is not configured. Please check your environment variables.') }
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName?.trim(),
          },
          emailRedirectTo: window.location.origin,
        },
      })
      
      if (error) {
        console.error('Sign up error:', error.message)
        return { error: new Error(getAuthErrorMessage(error.message)) }
      }
      
      return { error: null }
    } catch (err: any) {
      console.error('Unexpected sign up error:', err)
      return { error: new Error('An unexpected error occurred. Please try again.') }
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      // Validate inputs
      if (!email?.trim()) {
        return { error: new Error('Email is required') }
      }
      if (!password) {
        return { error: new Error('Password is required') }
      }
      if (!supabaseUrl || !supabaseKey) {
        return { error: new Error('Supabase is not configured. Please check your environment variables.') }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error.message)
        return { error: new Error(getAuthErrorMessage(error.message)) }
      }
      
      return { error: null }
    } catch (err: any) {
      console.error('Unexpected sign in error:', err)
      return { error: new Error('An unexpected error occurred. Please try again.') }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error.message)
        throw new Error('Failed to sign out. Please try again.')
      }
    } catch (err: any) {
      console.error('Unexpected sign out error:', err)
      throw new Error('An unexpected error occurred while signing out.')
    }
  }

  // Helper function to translate Supabase auth errors to user-friendly messages
  const getAuthErrorMessage = (message: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please try again.',
      'Email not confirmed': 'Please confirm your email address before signing in.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'Rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
      'Network error': 'Network connection failed. Please check your internet connection.',
    }
    
    return errorMap[message] || message || 'An error occurred. Please try again.'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
