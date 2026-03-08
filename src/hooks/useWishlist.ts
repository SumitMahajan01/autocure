import { useState, useEffect, useCallback } from 'react'
import { useAuth, supabase } from './useAuth.tsx'

export function useWishlist() {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set())
      return
    }

    try {
      const { data } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id)

      if (data) {
        const ids = new Set(data.map((item) => item.product_id))
        setWishlistIds(ids)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }, [user])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      alert('Please sign in to add to wishlist')
      return
    }

    setLoading(true)

    const isCurrentlyWishlisted = wishlistIds.has(productId)

    // Optimistic update
    setWishlistIds((prev) => {
      const newSet = new Set(prev)
      if (isCurrentlyWishlisted) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })

    try {
      if (isCurrentlyWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)

        if (error) throw error
        alert('Removed from wishlist')
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId })

        if (error) throw error
        alert('Added to wishlist')
      }
    } catch (error) {
      // Revert optimistic update on error
      setWishlistIds((prev) => {
        const newSet = new Set(prev)
        if (isCurrentlyWishlisted) {
          newSet.add(productId)
        } else {
          newSet.delete(productId)
        }
        return newSet
      })
      alert('Failed to update wishlist')
    } finally {
      setLoading(false)
    }
  }

  const isWishlisted = (productId: string): boolean => {
    return wishlistIds.has(productId)
  }

  return {
    toggleWishlist,
    isWishlisted,
    loading,
    wishlistIds,
  }
}
