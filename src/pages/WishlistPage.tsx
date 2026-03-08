import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { useAuth, supabase } from '../hooks/useAuth.tsx'
import { useWishlist } from '../hooks/useWishlist'
import { useCartStore } from '../stores/cartStore'
import { products as localProducts } from '../data/products'

interface WishlistProduct {
  id: string
  name: string
  price: number
  image: string | null
  category: string
  rating: number | null
}

export function WishlistPage() {
  const { user } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const { addItem } = useCartStore()

  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const ids = Array.from(wishlistIds)
      if (ids.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, image, category, rating')
          .in('id', ids)

        if (data) {
          setProducts(data)
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistProducts()
  }, [user, wishlistIds])

  const handleAddToCart = (product: WishlistProduct) => {
    const localProduct = localProducts.find((p) => p.name === product.name)
    if (localProduct) {
      addItem(localProduct)
      toast.success(`${localProduct.name} added to cart`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <CartPanel />
        <main className="pt-28 pb-12 container mx-auto px-4 max-w-4xl">
          <div className="glass-card p-8 text-center">
            <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Sign in to view your wishlist</p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            <span className="text-foreground">My </span>
            <span className="text-primary neon-text">Wishlist</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {products.length} item{products.length !== 1 ? 's' : ''} saved
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="font-display text-primary neon-text animate-pulse">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <Link to="/products">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{product.category}</span>
                    {product.rating && (
                      <>
                        <span>•</span>
                        <span>★ {product.rating.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                  <p className="font-display text-lg font-bold text-primary mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2.5 bg-primary text-primary-foreground rounded-lg neon-glow hover:brightness-110 transition-all"
                  >
                    <ShoppingCart size={16} />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
