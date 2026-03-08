import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-glass-border/30 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link 
              to="/" 
              className="font-display text-xl font-bold text-primary neon-text tracking-wider inline-block"
            >
              AUTOCURE
            </Link>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Precision care for your machine. Next-gen detailing products engineered with nano-technology.
            </p>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest uppercase text-foreground mb-3">
              Shop
            </h3>
            <div className="flex flex-col gap-2">
              <Link 
                to="/products" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                All Products
              </Link>
              <Link 
                to="/products" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Exterior Care
              </Link>
              <Link 
                to="/products" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Interior Care
              </Link>
              <Link 
                to="/products" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Premium Kits
              </Link>
            </div>
          </div>

          {/* Company column */}
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest uppercase text-foreground mb-3">
              Company
            </h3>
            <div className="flex flex-col gap-2">
              <Link 
                to="/about" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link 
                to="/wishlist" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Wishlist
              </Link>
            </div>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="font-display text-xs font-bold tracking-widest uppercase text-foreground mb-3">
              Contact
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary" />
                <span>support@autocure.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary" />
                <span>Neo Tokyo, Japan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-glass-border/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2040 AutoCure. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
