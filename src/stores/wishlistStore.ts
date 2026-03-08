import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../hooks/useAuth.tsx'

interface WishlistItem {
  id: string
  product_id: string
  products?: {
    id: string
    name: string
    price: number
    image: string
  }
}

interface WishlistState {
  wishlistIds: Set<string>
  wishlistItems: WishlistItem[]
  loading: boolean
  initialized: boolean
  
  // Actions
  fetchWishlist: (userId: string | undefined) => Promise<void>
  toggleWishlist: (userId: string | undefined, productId: string) => Promise<boolean>
  isWishlisted: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: new Set(),
      wishlistItems: [],
      loading: false,
      initialized: false,

      fetchWishlist: async (userId) => {
        // Skip if already initialized or no user
        if (get().initialized || !userId) {
          if (!userId) {
            set({ wishlistIds: new Set(), wishlistItems: [], initialized: true })
          }
          return
        }

        set({ loading: true })
        
        try {
          const { data } = await supabase
            .from('wishlists')
            .select('*, products(*)')
            .eq('user_id', userId)

          if (data) {
            const ids = new Set(data.map((item) => item.product_id))
            set({ 
              wishlistIds: ids, 
              wishlistItems: data,
              initialized: true 
            })
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error)
        } finally {
          set({ loading: false })
        }
      },

      toggleWishlist: async (userId, productId) => {
        if (!userId) {
          return false
        }

        const { wishlistIds, wishlistItems } = get()
        const isCurrentlyWishlisted = wishlistIds.has(productId)

        // Optimistic update
        if (isCurrentlyWishlisted) {
          const newIds = new Set(wishlistIds)
          newIds.delete(productId)
          set({ 
            wishlistIds: newIds,
            wishlistItems: wishlistItems.filter(item => item.product_id !== productId)
          })
        } else {
          const newIds = new Set(wishlistIds)
          newIds.add(productId)
          set({ wishlistIds: newIds })
        }

        try {
          if (isCurrentlyWishlisted) {
            // Remove from wishlist
            const { error } = await supabase
              .from('wishlists')
              .delete()
              .eq('user_id', userId)
              .eq('product_id', productId)

            if (error) throw error
          } else {
            // Add to wishlist
            const { data, error } = await supabase
              .from('wishlists')
              .insert({ user_id: userId, product_id: productId })
              .select('*, products(*)')
              .single()

            if (error) throw error
            
            // Update items with full product data
            if (data) {
              set({ 
                wishlistItems: [...wishlistItems, data] 
              })
            }
          }

          return !isCurrentlyWishlisted
        } catch (error) {
          // Revert optimistic update on error
          if (isCurrentlyWishlisted) {
            const newIds = new Set(wishlistIds)
            newIds.add(productId)
            set({ wishlistIds: newIds })
          } else {
            const newIds = new Set(wishlistIds)
            newIds.delete(productId)
            set({ wishlistIds: newIds })
          }
          console.error('Error toggling wishlist:', error)
          return isCurrentlyWishlisted
        }
      },

      isWishlisted: (productId) => {
        return get().wishlistIds.has(productId)
      },

      clearWishlist: () => {
        set({ 
          wishlistIds: new Set(), 
          wishlistItems: [], 
          initialized: false 
        })
      }
    }),
    {
      name: 'autocure-wishlist',
      partialize: (state) => ({ 
        wishlistIds: Array.from(state.wishlistIds) 
      }),
      onRehydrateStorage: () => (state) => {
        // Convert array back to Set after rehydration
        if (state && Array.isArray(state.wishlistIds)) {
          state.wishlistIds = new Set(state.wishlistIds)
        }
      }
    }
  )
)
