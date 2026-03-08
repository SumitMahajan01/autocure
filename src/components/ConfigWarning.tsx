import { AlertTriangle } from 'lucide-react'

export function ConfigWarning() {
  const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  if (hasSupabaseConfig) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="glass-card p-4 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-foreground text-sm">Configuration Required</p>
            <p className="text-muted-foreground text-xs mt-1">
              Supabase credentials not configured. Authentication and database features are disabled.
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Copy <code className="text-primary">.env.example</code> to <code className="text-primary">.env.local</code> and add your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
