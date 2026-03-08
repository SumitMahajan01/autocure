import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

// Hardcoded admin user ID - ONLY YOU CAN ACCESS ADMIN
const ADMIN_USER_ID = 'f0f0bde2-0b6f-44d4-a0fa-5b12edddac05'

export function useAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    // Strict check - only your user ID is admin
    setIsAdmin(user.id === ADMIN_USER_ID)
  }, [user])

  return isAdmin
}
