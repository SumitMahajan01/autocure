import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { useAuth } from '../hooks/useAuth'

const inputClass = "w-full pl-11 pr-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"

export function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'reset') {
        const { supabase } = await import('../hooks/useAuth.tsx')
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) {
          alert(error.message)
        } else {
          alert('Password reset email sent! Check your inbox.')
          setMode('login')
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          alert(error.message)
        } else {
          alert('Welcome back!')
          navigate('/')
        }
      } else {
        // signup
        const { error } = await signUp(email, password, displayName)
        if (error) {
          alert(error.message)
        } else {
          alert('Account created! Check your email to confirm.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <span className="text-foreground">Welcome </span>
            <span className="text-primary neon-text">Back</span>
          </>
        )
      case 'signup':
        return (
          <>
            <span className="text-foreground">Join </span>
            <span className="text-primary neon-text">Us</span>
          </>
        )
      case 'reset':
        return (
          <>
            <span className="text-foreground">Reset </span>
            <span className="text-primary neon-text">Password</span>
          </>
        )
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to access your account and orders'
      case 'signup':
        return 'Create an account to start shopping'
      case 'reset':
        return 'Enter your email to receive a reset link'
    }
  }

  const getSubmitText = () => {
    if (loading) return '...'
    switch (mode) {
      case 'login':
        return 'SIGN IN'
      case 'signup':
        return 'CREATE ACCOUNT'
      case 'reset':
        return 'SEND RESET LINK'
    }
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground">{getSubtitle()}</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 w-full max-w-md"
        >
          {/* Back button (reset mode only) */}
          {mode === 'reset' && (
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              Back to sign in
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (signup only) */}
            {mode === 'signup' && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Email (all modes) */}
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Password (login + signup only) */}
            {mode !== 'reset' && (
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* Forgot password (login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-display font-semibold tracking-wider rounded-lg neon-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getSubmitText()}
            </button>
          </form>

          {/* Demo Login Button (login only) */}
          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-glass-border/30">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true)
                  try {
                    const { error } = await signIn('demo@autocure.com', 'demo123456')
                    if (error) {
                      alert('Demo account not set up yet. Please sign up first.')
                    } else {
                      navigate('/')
                    }
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-muted/50 border border-glass-border/30 text-foreground font-display font-medium rounded-lg hover:bg-muted transition-all disabled:opacity-50"
              >
                Try Demo Account
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                No signup required - instant access
              </p>
            </div>
          )}

          {/* Mode toggle (login + signup only) */}
          {mode !== 'reset' && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
