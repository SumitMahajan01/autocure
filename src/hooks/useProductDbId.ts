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
        const { data } = await supabase
          .from('products')
          .select('id')
          .eq('name', productName)
          .single()

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
