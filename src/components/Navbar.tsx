import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, User, LogIn, Shield, Heart } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth.tsx'
import { useAdmin } from '../hooks/useAdmin'

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  
  const { toggleCart, itemCount } = useCartStore()
  const { user } = useAuth()
  const isAdmin = useAdmin()
  
  const cartCount = itemCount()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 glass transition-all duration-300 ${
          scrolled 
            ? 'shadow-lg border-b border-glass-border/30' 
            : 'border-b border-glass-border/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link 
              to="/" 
              className="font-display text-xl font-bold tracking-wider text-primary neon-text"
            >
              AUTOCURE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 tracking-wide uppercase"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1">
              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Wishlist - only if logged in */}
              {user && (
                <Link
                  to="/wishlist"
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              )}

              {/* Admin - only if admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  aria-label="Admin"
                >
                  <Shield size={20} className="text-purple-500 group-hover:text-purple-400 transition-colors" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </Link>
              )}

              {/* Profile/Auth */}
              {user ? (
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Profile"
                >
                  <User size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Sign in"
                >
                  <LogIn size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? (
                  <X size={20} className="text-muted-foreground" />
                ) : (
                  <Menu size={20} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden glass border-t border-glass-border/30 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2 tracking-wide uppercase transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2 tracking-wide uppercase transition-colors"
                >
                  Wishlist
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-secondary hover:text-primary py-2 tracking-wide uppercase transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-2 tracking-wide uppercase transition-colors"
                >
                  My Account
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-primary hover:text-primary/80 py-2 tracking-wide uppercase transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
