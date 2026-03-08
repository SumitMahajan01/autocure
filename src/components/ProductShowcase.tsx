import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { products, categories } from '../data/products'
import { ProductCard } from './ProductCard'

export function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [activeCategory])

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Premium </span>
            <span className="text-primary neon-text">Products</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Engineered with cutting-edge nano-technology for automotive perfection.
          </p>
        </motion.div>

        {/* Category filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
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

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
