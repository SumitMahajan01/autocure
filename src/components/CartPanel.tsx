import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'

export function CartPanel() {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem, total } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 glass border-l border-glass-border/30 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border/30">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                YOUR CART
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-foreground" />
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <ShoppingBag size={48} className="text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Link
                  to="/products"
                  onClick={() => setCartOpen(false)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="glass-card p-4 flex gap-4"
                    >
                      {/* Product image */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Info column */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-primary font-display font-bold">
                          ${item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Minus size={14} className="text-foreground" />
                          </button>
                          <span className="text-sm font-medium text-foreground w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Plus size={14} className="text-foreground" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-glass-border/30 space-y-4">
                  {/* Total row */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-primary neon-text">
                      ${total().toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout link */}
                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="block w-full text-center py-4 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
