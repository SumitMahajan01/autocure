import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../data/products'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  total: () => number
  itemCount: () => number
}

// Custom error class for cart operations
export class CartError extends Error {
  code: string
  
  constructor(message: string, code: string) {
    super(message)
    this.name = 'CartError'
    this.code = code
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        try {
          // Validate product
          if (!product?.id) {
            console.error('CartError: Invalid product')
            throw new CartError('Invalid product', 'INVALID_PRODUCT')
          }
          if (typeof product.price !== 'number' || product.price < 0) {
            console.error('CartError: Invalid product price')
            throw new CartError('Invalid product price', 'INVALID_PRICE')
          }

          set((state) => {
            const existingItem = state.items.find((i) => i.product.id === product.id)
            if (existingItem) {
              // Check max quantity limit
              if (existingItem.quantity >= 99) {
                console.warn('CartError: Maximum quantity reached')
                return state
              }
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              }
            }
            return { items: [...state.items, { product, quantity: 1 }] }
          })
        } catch (error) {
          console.error('Error adding item to cart:', error)
          throw error
        }
      },

      removeItem: (productId) => {
        try {
          if (!productId) {
            console.error('CartError: Invalid product ID')
            throw new CartError('Invalid product ID', 'INVALID_ID')
          }
          set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
          }))
        } catch (error) {
          console.error('Error removing item from cart:', error)
          throw error
        }
      },

      updateQuantity: (productId, quantity) => {
        try {
          if (!productId) {
            console.error('CartError: Invalid product ID')
            throw new CartError('Invalid product ID', 'INVALID_ID')
          }
          if (typeof quantity !== 'number' || quantity < 0) {
            console.error('CartError: Invalid quantity')
            throw new CartError('Invalid quantity', 'INVALID_QUANTITY')
          }
          if (quantity > 99) {
            console.warn('CartError: Maximum quantity is 99')
            quantity = 99
          }

          set((state) => {
            if (quantity <= 0) {
              return { items: state.items.filter((i) => i.product.id !== productId) }
            }
            return {
              items: state.items.map((i) =>
                i.product.id === productId ? { ...i, quantity } : i
              ),
            }
          })
        } catch (error) {
          console.error('Error updating cart quantity:', error)
          throw error
        }
      },

      clearCart: () => {
        try {
          set({ items: [] })
        } catch (error) {
          console.error('Error clearing cart:', error)
          throw new CartError('Failed to clear cart', 'CLEAR_ERROR')
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (open) => set({ isOpen: open }),

      total: () => {
        try {
          return get().items.reduce((sum, i) => {
            const price = i.product?.price ?? 0
            const qty = Math.max(0, i.quantity ?? 0)
            return sum + price * qty
          }, 0)
        } catch (error) {
          console.error('Error calculating cart total:', error)
          return 0
        }
      },

      itemCount: () => {
        try {
          return get().items.reduce((sum, i) => sum + Math.max(0, i.quantity ?? 0), 0)
        } catch (error) {
          console.error('Error calculating item count:', error)
          return 0
        }
      },
    }),
    {
      name: 'autocure-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Validate stored data on rehydrate
        if (state?.items) {
          state.items = state.items.filter(item => 
            item?.product?.id && 
            typeof item.product.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
          )
        }
      },
    }
  )
)
