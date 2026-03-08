import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { useCartStore } from '../stores/cartStore'
import { useAuth, supabase } from '../hooks/useAuth.tsx'

interface FormData {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

const inputClass = (field: string, errors: Record<string, string>) =>
  `px-4 py-3 rounded-lg bg-muted/50 border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors w-full ${
    errors[field] ? 'border-destructive focus:border-destructive' : 'border-glass-border/30 focus:border-primary'
  }`

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, total, clearCart } = useCartStore()
  
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (!form.zip.trim()) {
      newErrors.zip = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(form.zip)) {
      newErrors.zip = 'Invalid ZIP code'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to place an order')
      navigate('/auth')
      return
    }

    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      // Security: Verify cart is not empty
      if (items.length === 0) {
        toast.error('Your cart is empty')
        return
      }

      // Security: Verify cart total is positive and reasonable
      const cartTotal = total()
      if (cartTotal <= 0 || cartTotal > 10000) {
        toast.error('Invalid order amount')
        return
      }

      // Look up product DB UUIDs and verify prices
      const productNames = items.map(i => i.product.name)
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, name, price, is_active')
        .in('name', productNames)

      // Security: Verify all products exist and are active
      if (!dbProducts || dbProducts.length !== items.length) {
        toast.error('Some products are no longer available')
        return
      }

      // Security: Verify product prices match database
      for (const item of items) {
        const dbProduct = dbProducts.find(p => p.name === item.product.name)
        if (!dbProduct || dbProduct.price !== item.product.price) {
          toast.error('Product prices have changed. Please refresh your cart.')
          return
        }
        if (!dbProduct.is_active) {
          toast.error(`${item.product.name} is no longer available`)
          return
        }
      }

      const productMap = new Map(dbProducts?.map(p => [p.name, p.id]))

      // Create order with unpaid status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: cartTotal,
          shipping_address: { ...form },
          payment_status: 'unpaid',
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Insert order items
      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: productMap.get(i.product.name),
        quantity: Math.min(i.quantity, 99), // Limit quantity
        price: i.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Check if Stripe is configured
      const stripeConfigured = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

      if (stripeConfigured) {
        // Create Stripe Checkout Session via edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              order_id: order.id,
              items: items.map(i => ({
                name: i.product.name,
                description: i.product.description,
                price: i.product.price,
                quantity: i.quantity,
                image: i.product.image
              })),
              customer_email: form.email,
              success_url: `${window.location.origin}/order-confirmation?order_id=${order.id}`,
              cancel_url: `${window.location.origin}/checkout?canceled=true&order_id=${order.id}`
            })
          }
        )

        const { url, error: paymentError } = await response.json()

        if (paymentError) throw new Error(paymentError)

        // Redirect to Stripe Checkout
        if (url) {
          window.location.href = url
          return
        }
      }

      // If Stripe not configured, simulate order placement
      toast.success('Order placed successfully!')
      clearCart()
      navigate('/order-confirmation?order_id=' + order.id)
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <CartPanel />
        <main className="pt-28 pb-12 container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Your cart is empty
          </h1>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4">
        {/* Page heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-bold text-center mb-12"
        >
          <span className="text-foreground">Check</span>
          <span className="text-primary neon-text">out</span>
        </motion.h1>

        {/* Not signed in banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center mb-8 max-w-2xl mx-auto"
          >
            <p className="text-muted-foreground mb-4">Please sign in to place an order</p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        )}

        {/* Main grid */}
        <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Left column - Shipping form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">
                Shipping Address
              </h2>

              {/* Row 1: First + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    className={inputClass('firstName', errors)}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    className={inputClass('lastName', errors)}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={inputClass('email', errors)}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Row 3: Address */}
              <div>
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange('address')}
                  className={inputClass('address', errors)}
                />
                {errors.address && (
                  <p className="text-xs text-destructive mt-1">{errors.address}</p>
                )}
              </div>

              {/* Row 4: City + State + ZIP */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange('city')}
                    className={inputClass('city', errors)}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange('state')}
                    className={inputClass('state', errors)}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive mt-1">{errors.state}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={form.zip}
                    onChange={handleChange('zip')}
                    className={inputClass('zip', errors)}
                  />
                  {errors.zip && (
                    <p className="text-xs text-destructive mt-1">{errors.zip}</p>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="glass-card p-3 text-center">
                  <ShieldCheck size={20} className="mx-auto mb-1 text-primary" />
                  <span className="text-xs text-muted-foreground">Secure Order</span>
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !user}
                className="w-full py-4 bg-primary text-primary-foreground font-display font-semibold tracking-wider rounded-lg neon-glow hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING...' : `PLACE ORDER — $${total().toFixed(2)}`}
              </button>
            </form>
          </motion.div>

          {/* Right column - Order summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="glass-card p-6 space-y-4 sticky top-24">
              <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">
                Order Summary
              </h2>

              {/* Cart items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-primary font-display font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-glass-border/30" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-primary neon-text">
                    ${total().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
