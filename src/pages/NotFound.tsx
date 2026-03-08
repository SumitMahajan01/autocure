import { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { Navbar } from '../components/Navbar'

export function NotFound() {
  const location = useLocation()

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    )
  }, [location.pathname])

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center"
      >
        <h1 className="font-display text-8xl font-bold mb-4">
          <span className="text-foreground">4</span>
          <span className="text-primary neon-text">0</span>
          <span className="text-foreground">4</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-2">Page not found</p>

        <code className="text-primary/60 text-sm mb-8">{location.pathname}</code>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 glass-card font-semibold rounded-lg hover:border-primary/40 transition-all"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
