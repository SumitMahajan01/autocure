// API utility with error handling

export class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 30000, retries = 3, ...fetchOptions } = options
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }
      
      // Parse JSON response
      const data = await response.json()
      return data as T
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Don't retry if aborted
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout. Please try again.', 408)
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw lastError || new ApiError('Request failed after retries')
}

// Supabase-specific error handling
export function handleSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred'
  
  // Common Supabase error codes
  const errorMessages: Record<string, string> = {
    '23505': 'This record already exists.',
    '23503': 'Referenced record does not exist.',
    '42501': 'You do not have permission to perform this action.',
    'PGRST301': 'JWT expired. Please sign in again.',
    'PGRST116': 'Results contain more than one row',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  }
  
  const code = error.code || error.error_code
  if (code && errorMessages[code]) {
    return errorMessages[code]
  }
  
  return error.message || 'An unexpected error occurred'
}

// Safe localStorage operations
export const safeStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage get error:', e)
      return null
    }
  },
  
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      console.warn('localStorage set error:', e)
      return false
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.warn('localStorage remove error:', e)
      return false
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.warn('localStorage clear error:', e)
      return false
    }
  }
}

// Network status monitoring
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

export function subscribeToNetworkChanges(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
