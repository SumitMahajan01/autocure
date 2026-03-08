import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { User, Package, Heart, LogOut, Save, ShoppingBag } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartPanel } from '../components/CartPanel'
import { useAuth, supabase } from '../hooks/useAuth.tsx'
import { useCartStore } from '../stores/cartStore'
import { products } from '../data/products'

const inputClass = "w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"

const statusColor: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  shipped: "text-cyan-400 bg-cyan-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-destructive bg-destructive/10",
}

const tabs = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "orders" as const, label: "Orders", icon: Package },
  { id: "wishlist" as const, label: "Wishlist", icon: Heart },
]

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  payment_status: string
  order_items?: OrderItem[]
}

interface WishlistItem {
  id: string
  products: {
    id: string
    name: string
    price: number
    image: string
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const { addItem } = useCartStore()

  const [tab, setTab] = useState<"profile" | "orders" | "wishlist">("profile")
  const [profile, setProfile] = useState({
    display_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth")
    }
  }, [user, authLoading, navigate])

  // Data fetching
  useEffect(() => {
    if (authLoading || !user) return

    const fetchData = async () => {
      setDataLoading(true)
      try {
        // Fetch orders with items and product details
        const { data: ordersWithItems } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              products (
                id,
                name,
                image
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        const [profileRes, wishlistRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("wishlists").select("*, products(*)").eq("user_id", user.id),
        ])

        if (profileRes.data) {
          setProfile({
            display_name: profileRes.data.display_name || "",
            phone: profileRes.data.phone || "",
            address: profileRes.data.address || "",
            city: profileRes.data.city || "",
            state: profileRes.data.state || "",
            zip: profileRes.data.zip || "",
          })
        }

        if (ordersWithItems) {
          setOrders(ordersWithItems)
        }

        if (wishlistRes.data) {
          setWishlist(wishlistRes.data)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading])

  // Update tab labels with counts
  const tabsWithCounts = tabs.map(t => ({
    ...t,
    label: t.id === "orders" ? `Orders (${orders.length})` : 
           t.id === "wishlist" ? `Wishlist (${wishlist.length})` : t.label
  }))

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name.trim() || null,
          phone: profile.phone.trim() || null,
          address: profile.address.trim() || null,
          city: profile.city.trim() || null,
          state: profile.state.trim() || null,
          zip: profile.zip.trim() || null,
        })
        .eq("user_id", user.id)

      if (error) throw error
      toast.success('Profile saved')
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddToCart = (wishlistItem: WishlistItem) => {
    const localProduct = products.find(p => p.name === wishlistItem.products.name)
    if (localProduct) {
      addItem(localProduct)
      toast.success(`${localProduct.name} added to cart`)
    }
  }

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", itemId)
      if (error) throw error
      setWishlist(prev => prev.filter(item => item.id !== itemId))
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove from wishlist')
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <CartPanel />
        <main className="pt-28 pb-12 container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <p className="font-display text-primary neon-text animate-pulse">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <CartPanel />

      <main className="pt-28 pb-12 container mx-auto px-4 max-w-3xl">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">
              <span className="text-foreground">My </span>
              <span className="text-primary neon-text">Account</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabsWithCounts.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Loading state */}
        {dataLoading ? (
          <div className="glass-card p-8 text-center">
            <p className="font-display text-primary neon-text animate-pulse">Loading...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            {tab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 md:p-8 space-y-5"
              >
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Phone</label>
                  <input
                    type="tel"
                    maxLength={20}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className={inputClass}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Address</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className={inputClass}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">City</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className={inputClass}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">State</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className={inputClass}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">ZIP</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={profile.zip}
                      onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                      className={inputClass}
                      placeholder="12345"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 font-display tracking-wider disabled:opacity-50 transition-all"
                >
                  <Save size={18} />
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </motion.div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="glass-card overflow-hidden">
                      {/* Order Header */}
                      <div className="p-5 flex items-center justify-between border-b border-glass-border/30">
                        <div>
                          <p className="font-display font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full ${statusColor[order.status] || "text-muted-foreground bg-muted/30"}`}>
                            {order.status}
                          </span>
                          <span className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full ${
                            order.payment_status === 'paid' ? 'text-green-400 bg-green-400/10' :
                            order.payment_status === 'unpaid' ? 'text-yellow-400 bg-yellow-400/10' :
                            'text-muted-foreground bg-muted/30'
                          }`}>
                            {order.payment_status}
                          </span>
                          <span className="font-display text-lg font-bold text-primary">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="p-5 bg-muted/10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Items</p>
                          <div className="space-y-3">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <img
                                  src={item.products?.image || "/placeholder.svg"}
                                  alt={item.products?.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground truncate">{item.products?.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {tab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {wishlist.length === 0 ? (
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
                  wishlist.map((item) => (
                    <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                      <img
                        src={item.products?.image || "/placeholder.svg"}
                        alt={item.products?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.products?.name}</p>
                        <p className="text-sm text-primary font-display font-bold">
                          ${item.products?.price?.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ShoppingBag size={18} />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Heart size={18} className="fill-destructive" />
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  )
}
