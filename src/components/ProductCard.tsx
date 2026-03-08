import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import type { Product } from '../data/products'
import { useCartStore } from '../stores/cartStore'
import { useWishlist } from '../hooks/useWishlist'
import { useProductDbId } from '../hooks/useProductDbId'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const dbId = useProductDbId(product.name)
  const wishlisted = dbId ? isWishlisted(dbId) : false

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    // Simple alert for now since toast isn't set up
    alert(`${product.name} added to cart!`)
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dbId) {
      toggleWishlist(dbId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`}>
        <div className="group glass-card overflow-hidden hover:border-primary/40 transition-all duration-500 cursor-pointer">
          {/* Image area */}
          <div className="relative aspect-square overflow-hidden bg-muted/20">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Wishlist button */}
            {dbId && (
              <button
                onClick={handleWishlistClick}
                className="absolute top-3 right-3 p-2 bg-background/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Heart
                  size={16}
                  className={wishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}
                />
              </button>
            )}
            
            {/* Quick add to cart button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 p-3 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 neon-glow"
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>

          {/* Info area */}
          <div className="p-4">
            {/* Rating row */}
            <div className="flex items-center gap-1 mb-2">
              <Star size={14} className="fill-primary text-primary" />
              <span className="text-sm font-medium text-primary">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            {/* Product name */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>

            {/* Price + features row */}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex gap-1">
                {product.features.slice(0, 2).map((feature, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
