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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) => set((state) => {
    const existingItem = state.items.find((i) => i.product.id === product.id)
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    }
    return { items: [...state.items, { product, quantity: 1 }] }
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product.id !== productId),
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter((i) => i.product.id !== productId) }
    }
    return {
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }
  }),

  clearCart: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  setCartOpen: (open) => set({ isOpen: open }),

  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'autocure-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
