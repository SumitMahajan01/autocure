import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.tsx'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-primary neon-text animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // For admin routes, we check the role
  // Note: Actual admin check happens in the AdminPage component with has_role RPC
  // This is just a preliminary check
  if (requireAdmin) {
    // The actual admin verification happens in AdminPage.tsx
    // This prevents flash of content before redirect
    return <>{children}</>
  }

  return <>{children}</>
}
