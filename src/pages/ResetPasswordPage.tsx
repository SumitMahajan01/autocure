import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../hooks/useAuth.tsx'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Check for recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('type=recovery')) {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        toast.error('Failed to reset password')
      } else {
        setSuccess(true)
        toast.success('Password reset successfully!')
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Back link */}
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Set New Password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enter your new password below
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !!error}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
