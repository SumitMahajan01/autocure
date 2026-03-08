import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: { componentStack: string } | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen animated-bg flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-lg w-full text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Something Went Wrong
              </h1>
              
              <p className="text-muted-foreground mb-6">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left overflow-auto">
                  <p className="text-sm font-mono text-destructive mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted/50 border border-glass-border/30 text-foreground font-semibold rounded-lg hover:bg-muted transition-all"
                >
                  <Home size={18} />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Hook for async error handling
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string): string => {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error(`Error${context ? ` in ${context}` : ''}:`, error)
      return message
    },
    
    handleAsync: async <T,>(
      promise: Promise<T>,
      options?: {
        context?: string
        onError?: (error: Error) => void
        fallback?: T
      }
    ): Promise<T | undefined> => {
      try {
        return await promise
      } catch (error) {
        console.error(`Error${options?.context ? ` in ${options.context}` : ''}:`, error)
        
        if (options?.onError && error instanceof Error) {
          options.onError(error)
        }
        
        return options?.fallback
      }
    }
  }
}
