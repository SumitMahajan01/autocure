import { useState, useEffect } from 'react'
import { supabase } from './useAuth.tsx'

export function useProductDbId(productName: string): string | null {
  const [dbId, setDbId] = useState<string | null>(null)

  useEffect(() => {
    if (!productName) {
      setDbId(null)
      return
    }

    const fetchDbId = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .eq('name', productName)
          .maybeSingle()

        if (error) {
          // Silently handle error - product might not exist in DB yet
          setDbId(null)
          return
        }

        if (data) {
          setDbId(data.id)
        }
      } catch (error) {
        // Product might not exist in DB yet
        setDbId(null)
      }
    }

    fetchDbId()
  }, [productName])

  return dbId
}
