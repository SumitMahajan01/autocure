import { useState, useEffect } from 'react'
import { supabase } from './useAuth.tsx'

// Module-level cache
let cachedMap: Map<string, string> | null = null
let fetchPromise: Promise<Map<string, string>> | null = null

async function fetchAllProductIds(): Promise<Map<string, string>> {
  // Return cached map if available
  if (cachedMap) {
    return cachedMap
  }

  // Return in-flight promise if exists
  if (fetchPromise) {
    return fetchPromise
  }

  // Create new fetch promise
  fetchPromise = (async () => {
    try {
      const { data, error } = await supabase.from('products').select('id, name')
      
      if (error) {
        console.warn('Failed to fetch product IDs:', error.message)
        cachedMap = new Map()
        return cachedMap
      }

      const map = new Map<string, string>()
      if (data) {
        data.forEach((product) => {
          map.set(product.name, product.id)
        })
      }

      cachedMap = map
      return map
    } catch (err) {
      console.warn('Error fetching product IDs:', err)
      cachedMap = new Map()
      return cachedMap
    }
  })()

  return fetchPromise
}

export function invalidateProductDbIds(): void {
  cachedMap = null
  fetchPromise = null
}

export function useProductDbId(productName: string): string | null {
  const [id, setId] = useState<string | null>(cachedMap?.get(productName) ?? null)

  useEffect(() => {
    fetchAllProductIds().then((map) => {
      setId(map.get(productName) ?? null)
    })
  }, [productName])

  return id
}

export function useProductDbIds(): Map<string, string> {
  const [map, setMap] = useState<Map<string, string>>(cachedMap ?? new Map())

  useEffect(() => {
    fetchAllProductIds().then((newMap) => {
      setMap(new Map(newMap))
    })
  }, [])

  return map
}
