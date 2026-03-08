import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  Heart, 
  ZoomIn, 
  Shield, 
  Truck, 
  RotateCcw,
  Tag
} from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { ProductCard } from '../components/ProductCard'
import { ReviewSection } from '../components/ReviewSection'
import { products } from '../data/products'
import { useCartStore } from '../stores/cartStore'


interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
  profiles?: { display_name: string | null } | null
}

// Stub hook for DB product ID lookup
function useProductDbId(productName: string): string | null {
  // In real implementation, this would query supabase
  return productName ? `db-${productName.replace(/\s+/g, '-').toLowerCase()}` : null
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCartStore()
  
  const [tab, setTab] = useState<'details' | 'reviews'>('details')
  const [reviews, setReviews] = useState<Review[]>([])
  const [zoomed, setZoomed] = useState(false)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  // Find product from local array
  const product = useMemo(() => {
    return products.find((p) => p.id === id)
  }, [id])

  const dbProductId = useProductDbId(product?.name || '')

  // Fetch reviews (stub implementation)
  const fetchReviews = async (pid: string | null) => {
    if (!pid) return
    // Stub: In real implementation, query supabase
    // const { data } = await supabase.from('reviews').select('*').eq('product_id', pid)...
    setReviews([])
  }

  useEffect(() => {
    if (dbProductId) {
      fetchReviews(dbProductId)
    }
  }, [dbProductId])

  // Get related products
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <main className="pt-28 pb-12 container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Product not found
          </h1>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem(product)
    }
    toast.success(`${qty} × ${product.name} added to cart`)
  }

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.max(1, Math.min(10, prev + delta)))
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        {/* Two-column grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="glass-card overflow-hidden aspect-square cursor-zoom-in group relative"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  zoomed ? 'scale-150' : 'group-hover:scale-105'
                }`}
              />
              {/* Zoom icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="p-3 bg-background/60 backdrop-blur-sm rounded-full">
                  <ZoomIn size={24} className="text-foreground" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Product info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Category label */}
            <span className="text-xs font-medium uppercase tracking-widest text-secondary mb-2">
              {product.category}
            </span>

            {/* Star rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i <= Math.round(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Product name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.features.slice(0, 3).map((feature, i) => (
                <span key={i} className="glass-card px-4 py-2 text-sm text-primary font-medium">
                  {feature}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-4">
              {(product as any).discount_percent > 0 && (product as any).original_price ? (
                <>
                  <span className="font-display text-4xl font-bold text-primary neon-text">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="font-display text-xl text-muted-foreground line-through">
                    ${Number((product as any).original_price).toFixed(2)}
                  </span>
                  <span className="bg-destructive text-destructive-foreground text-sm px-2 py-1 rounded">
                    -{(product as any).discount_percent}%
                  </span>
                </>
              ) : (
                <span className="font-display text-4xl font-bold text-primary neon-text">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-green-400 text-sm font-medium">
                In Stock
              </span>
            </div>

            {/* Product Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-6">
              {(product as any).brand && (
                <span>by {(product as any).brand}</span>
              )}
              {(product as any).sku && (
                <span className="text-xs">SKU: {(product as any).sku}</span>
              )}
              {(product as any).weight && (product as any).dimensions && (
                <span className="text-xs">{(product as any).weight} • {(product as any).dimensions}</span>
              )}
            </div>

            {/* Tags */}
            {(product as any).tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(product as any).tags.map((tag: string, i: number) => (
                  <span key={i} className="glass-card px-3 py-1 text-xs text-muted-foreground">
                    <Tag size={12} className="inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="flex items-center gap-4 mb-8">
              {/* Qty selector */}
              <div className="glass-card flex items-center">
                <button
                  onClick={() => handleQtyChange(-1)}
                  className="px-4 py-3 text-foreground hover:text-primary transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-foreground">{qty}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  className="px-4 py-3 text-foreground hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all duration-300"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="p-3 glass-card rounded-lg hover:border-primary/50 transition-colors"
              >
                <Heart
                  size={20}
                  className={wishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}
                />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3 text-center">
                <Shield size={20} className="mx-auto mb-1 text-primary" />
                <span className="text-xs text-muted-foreground">2-Year Warranty</span>
              </div>
              <div className="glass-card p-3 text-center">
                <Truck size={20} className="mx-auto mb-1 text-primary" />
                <span className="text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="glass-card p-3 text-center">
                <RotateCcw size={20} className="mx-auto mb-1 text-primary" />
                <span className="text-xs text-muted-foreground">30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs section */}
        <div className="mt-16">
          {/* Tab buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('details')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                tab === 'details'
                  ? 'bg-primary text-primary-foreground neon-glow'
                  : 'glass-card text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setTab('reviews')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                tab === 'reviews'
                  ? 'bg-primary text-primary-foreground neon-glow'
                  : 'glass-card text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {tab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Specifications Table */}
                {(product as any).specifications && Object.keys((product as any).specifications).length > 0 && (
                  <div className="glass-card p-6 md:p-8">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6">
                      Specifications
                    </h2>
                    <div className="divide-y divide-glass-border/30">
                      {Object.entries((product as any).specifications).map(([key, value], i) => (
                        <div key={key} className={`flex justify-between py-3 ${i % 2 === 0 ? 'bg-muted/20' : ''} px-4 -mx-4`}>
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-foreground font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping & Returns Card */}
                <div className="glass-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">
                    Shipping & Returns
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Truck size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          {(product as any).shipping_info || 'Standard shipping available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Returns</p>
                        <p className="text-sm text-muted-foreground">
                          {(product as any).return_policy || 'Hassle-free returns'} ({(product as any).return_days || 30} days)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Warranty</p>
                        <p className="text-sm text-muted-foreground">
                          {(product as any).warranty || 'Manufacturer warranty included'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features grid */}
                <div className="glass-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">
                    Key Features
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-display font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full description */}
                <div className="glass-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description} This premium product is designed for automotive enthusiasts 
                    who demand the best. Engineered with advanced nano-technology, it delivers 
                    exceptional results that last. Perfect for both professional detailers and 
                    DIY enthusiasts who want showroom-quality results at home.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ReviewSection
                  productId={dbProductId || ''}
                  reviews={reviews}
                  onReviewAdded={() => fetchReviews(dbProductId)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-2">
              <span className="text-foreground">Related </span>
              <span className="text-primary neon-text">Products</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
