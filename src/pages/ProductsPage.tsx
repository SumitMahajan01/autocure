import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { ProductCard } from '../components/ProductCard'
import { products, categories } from '../data/products'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'name'

const sortLabels: Record<SortOption, string> = {
  default: 'Featured',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
  rating: 'Top Rated',
  name: 'Name A–Z',
}

export function ProductsPage() {
  const [active, setActive] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [showSort, setShowSort] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    let result = [...products]

    // Filter by category
    if (active !== 'all') {
      result = result.filter((p) => p.category === active)
    }

    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.features.some((f) => f.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // Keep original order
        break
    }

    return result
  }, [active, search, sort])

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />
      
      <main className="pt-28 pb-12 container mx-auto px-4">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">All </span>
            <span className="text-primary neon-text">Products</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our complete range of premium car care products engineered with nano-technology.
          </p>
        </motion.div>

        {/* Search & Sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto"
        >
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground hover:border-primary/50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span className="text-sm">{sortLabels[sort]}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card border border-glass-border/30 rounded-lg z-20 overflow-hidden"
                >
                  {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSort(option)
                        setShowSort(false)
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                        sort === option
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      {sortLabels[option]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => {
            const isActive = active === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActive(category.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground neon-glow'
                    : 'glass-card text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {category.label}
              </button>
            )
          })}
        </motion.div>

        {/* Results grid or empty state */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">No products found</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Try a different search or category
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Result count */}
            <p className="text-center text-xs text-muted-foreground mt-8">
              Showing {filtered.length} of {products.length} products
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
