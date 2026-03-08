import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { supabase, useAuth } from '../hooks/useAuth.tsx'

interface OrderDetails {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
  shipping_address: any
}

export function OrderConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const orderId = searchParams.get('order_id')
  const sessionId = searchParams.get('session_id')

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      navigate('/')
      return
    }

    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      // If coming from Stripe success, verify payment status
      if (sessionId && data.payment_status === 'unpaid') {
        // Poll for payment status update (webhook may not have processed yet)
        setTimeout(fetchOrderDetails, 2000)
      }

      setOrder(data)
    } catch (error) {
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <CartPanel />
        <main className="pt-28 pb-12 container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <CartPanel />
        <main className="pt-28 pb-12 container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Order Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const isPaid = order.payment_status === 'paid'

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isPaid ? 'Payment Successful!' : 'Order Placed!'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isPaid
                ? 'Thank you for your purchase. Your order has been confirmed.'
                : 'Your order has been placed and is awaiting payment confirmation.'}
            </p>

            {/* Order Details */}
            <div className="glass-card p-6 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Package size={24} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Order Details
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-foreground">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`capitalize ${
                    order.status === 'delivered' ? 'text-green-400' :
                    order.status === 'processing' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className={`capitalize ${
                    isPaid ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="border-t border-glass-border/30 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="font-display text-xl font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="glass-card p-6 mb-8 text-left">
                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Shipping To
                </h3>
                <p className="text-foreground">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.address}</p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 glass-card font-semibold rounded-lg hover:border-primary/50 transition-all"
              >
                <Home size={18} />
                Continue Shopping
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
                >
                  View Orders
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
