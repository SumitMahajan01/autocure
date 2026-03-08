import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Package,
  ShoppingBag,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  BarChart3,
} from 'lucide-react'
import { useAuth, supabase } from '../hooks/useAuth.tsx'

// Hardcoded admin user ID - ONLY YOU CAN ACCESS ADMIN
const ADMIN_USER_ID = 'f0f0bde2-0b6f-44d4-a0fa-5b12edddac05'
import { AdminAnalytics } from '../components/AdminAnalytics'

interface ProductForm {
  name: string
  price: string
  original_price: string
  discount_percent: string
  category: string
  description: string
  features: string
  image: string
  in_stock: boolean
  rating: string
  reviews_count: string
  warranty: string
  shipping_info: string
  return_policy: string
  return_days: string
  specifications: string
  weight: string
  dimensions: string
  sku: string
  brand: string
  tags: string
}

const emptyProduct: ProductForm = {
  name: '',
  price: '',
  original_price: '',
  discount_percent: '0',
  category: 'exterior',
  description: '',
  features: '',
  image: '',
  in_stock: true,
  rating: '0',
  reviews_count: '0',
  warranty: '',
  shipping_info: '',
  return_policy: 'Hassle-free returns',
  return_days: '30',
  specifications: '',
  weight: '',
  dimensions: '',
  sku: '',
  brand: '',
  tags: '',
}

const categories = ['exterior', 'interior', 'tools', 'kits']

const statusColor: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-destructive bg-destructive/10',
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const inputClass = 'w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm'

export function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'orders' | 'products' | 'messages' | 'analytics'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Access control
  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    const checkAdmin = () => {
      // Strict check - only your user ID can access admin
      if (user.id !== ADMIN_USER_ID) {
        toast.error('Access denied')
        navigate('/')
      } else {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [user, navigate])

  // Data fetch
  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      const [ordersRes, productsRes, messagesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      ])

      if (ordersRes.data) setOrders(ordersRes.data)
      if (productsRes.data) setProducts(productsRes.data)
      if (messagesRes.data) setMessages(messagesRes.data)
    }

    fetchData()
  }, [isAdmin])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProducts(data)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      toast.success('Status updated')
    }
  }

  const toggleOrderExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }

    setExpandedOrder(orderId)

    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from('order_items')
        .select('*, products(name, image)')
        .eq('order_id', orderId)

      if (data) {
        setOrderItems((prev) => ({ ...prev, [orderId]: data }))
      }
    }
  }

  const markMessageRead = async (id: string) => {
    const { error } = await supabase.from('contact_messages').update({ read: true }).eq('id', id)

    if (error) {
      toast.error('Failed to mark as read')
    } else {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
    }
  }

  const parseSpecifications = (raw: string): Record<string, string> => {
    const specs: Record<string, string> = {}
    raw.split('\n').forEach((line) => {
      const [key, ...rest] = line.split(':')
      if (key?.trim() && rest.length) specs[key.trim()] = rest.join(':').trim()
    })
    return specs
  }

  const specsToString = (obj: Record<string, string>): string => {
    return Object.entries(obj || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
  }

  const startEditProduct = (p: any) => {
    setEditingProduct(p.id)
    setProductForm({
      name: p.name,
      price: p.price.toString(),
      original_price: p.original_price ? p.original_price.toString() : '',
      discount_percent: p.discount_percent?.toString() || '0',
      category: p.category,
      description: p.description || '',
      features: Array.isArray(p.features) ? p.features.join(', ') : '',
      image: p.image || '',
      in_stock: p.in_stock ?? true,
      rating: p.rating?.toString() || '0',
      reviews_count: p.reviews_count?.toString() || '0',
      warranty: p.warranty || '',
      shipping_info: p.shipping_info || '',
      return_policy: p.return_policy || 'Hassle-free returns',
      return_days: p.return_days?.toString() || '30',
      specifications: specsToString(p.specifications || {}),
      weight: p.weight || '',
      dimensions: p.dimensions || '',
      sku: p.sku || '',
      brand: p.brand || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
    })
    setShowAddProduct(false)
  }

  const startAddProduct = () => {
    setShowAddProduct(true)
    setEditingProduct(null)
    setProductForm(emptyProduct)
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setShowAddProduct(false)
    setProductForm(emptyProduct)
  }

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price.trim()) {
      toast.error('Name and price are required')
      return
    }

    setSaving(true)

    const payload = {
      name: productForm.name.trim(),
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      discount_percent: parseFloat(productForm.discount_percent) || 0,
      category: productForm.category,
      description: productForm.description.trim() || null,
      features: productForm.features.split(',').map((f) => f.trim()).filter(Boolean),
      image: productForm.image.trim() || null,
      in_stock: productForm.in_stock,
      rating: parseFloat(productForm.rating) || 0,
      reviews_count: parseInt(productForm.reviews_count) || 0,
      warranty: productForm.warranty.trim() || null,
      shipping_info: productForm.shipping_info.trim() || null,
      return_policy: productForm.return_policy.trim() || null,
      return_days: parseInt(productForm.return_days) || 30,
      specifications: parseSpecifications(productForm.specifications),
      weight: productForm.weight.trim() || null,
      dimensions: productForm.dimensions.trim() || null,
      sku: productForm.sku.trim() || null,
      brand: productForm.brand.trim() || null,
      tags: productForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Product added')
      }

      await fetchProducts()
      cancelEdit()
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return

    setDeleting(id)
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      await fetchProducts()
      toast.success('Product deleted')
    }
    setDeleting(null)
  }

  const toggleStock = async (id: string, currentStock: boolean) => {
    const { error } = await supabase.from('products').update({ in_stock: !currentStock }).eq('id', id)

    if (error) {
      toast.error('Failed to update stock')
    } else {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: !currentStock } : p)))
      toast.success('Stock updated')
    }
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <p className="font-display text-primary neon-text animate-pulse">Loading...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'products' as const, label: 'Products', icon: ShoppingBag },
    { id: 'messages' as const, label: 'Messages', icon: Mail },
  ]

  return (
    <div className="min-h-screen animated-bg">
      <header className="glass border-b border-glass-border/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
          <h1 className="font-display text-3xl font-bold">
            <span className="text-foreground">Admin </span>
            <span className="text-primary neon-text">Dashboard</span>
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Package size={24} className="text-primary" />
            </div>
            <p className="font-display text-3xl font-bold text-primary neon-text">{orders.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Orders</p>
          </div>
          <div className="glass-card p-6 text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={24} className="text-primary" />
            </div>
            <p className="font-display text-3xl font-bold text-primary neon-text">{products.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Products</p>
          </div>
          <div className="glass-card p-6 text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mail size={24} className="text-primary" />
            </div>
            <p className="font-display text-3xl font-bold text-primary neon-text">
              {messages.filter((m) => !m.read).length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Unread</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground neon-glow'
                    : 'glass-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* Analytics Tab */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminAnalytics orders={orders} products={products} />
            </motion.div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="glass-card overflow-hidden">
                    <div
                      onClick={() => toggleOrderExpand(order.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                    >
                      <div>
                        <p className="font-display font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-display font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border-0 cursor-pointer ${statusColor[order.status] || 'text-muted-foreground bg-muted/30'}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="border-t border-glass-border/30 p-5 bg-muted/10">
                        {order.shipping_address && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Shipping</p>
                            <p className="text-sm text-foreground">
                              {order.shipping_address.firstName} {order.shipping_address.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.shipping_address.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                        <div className="space-y-2">
                          {orderItems[order.id]?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <img
                                src={item.products?.image || '/placeholder.svg'}
                                alt={item.products?.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <span className="text-sm text-foreground flex-1">{item.products?.name}</span>
                              <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                              <span className="text-sm text-primary font-display">${Number(item.price * item.quantity).toFixed(2)}</span>
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

          {/* Products Tab */}
          {tab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {!showAddProduct && !editingProduct && (
                <button
                  onClick={startAddProduct}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all"
                >
                  <Plus size={18} />
                  Add Product
                </button>
              )}

              <AnimatePresence>
                {(showAddProduct || editingProduct) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-foreground">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <button onClick={cancelEdit} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Section 1 - Basic Info */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Basic Info</p>
                      <input
                        type="text"
                        placeholder="Product Name *"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className={inputClass}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price *"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Original Price"
                          value={productForm.original_price}
                          onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Discount %"
                          value={productForm.discount_percent}
                          onChange={(e) => setProductForm({ ...productForm, discount_percent: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className={inputClass}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Brand"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="SKU"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <textarea
                        placeholder="Description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className={`${inputClass} min-h-[80px] resize-none`}
                      />
                      <input
                        type="text"
                        placeholder="Features (comma separated)"
                        value={productForm.features}
                        onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Tags (comma separated, e.g. premium, best-seller, new)"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Section 2 - Media */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Media</p>
                      <div className="relative">
                        <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                      {productForm.image && (
                        <img
                          src={productForm.image}
                          alt="Preview"
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                    </div>

                    {/* Section 3 - Shipping & Physical */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Shipping & Physical</p>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Weight (e.g. 0.5 lbs)"
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Dimensions (e.g. 10 x 6 x 3 inches)"
                          value={productForm.dimensions}
                          onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <textarea
                        placeholder="Shipping Info (e.g. Free shipping over $50. Ships in 1-3 business days.)"
                        value={productForm.shipping_info}
                        onChange={(e) => setProductForm({ ...productForm, shipping_info: e.target.value })}
                        className={`${inputClass} min-h-[60px] resize-none`}
                      />
                    </div>

                    {/* Section 4 - Warranty & Returns */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Warranty & Returns</p>
                      <input
                        type="text"
                        placeholder="Warranty (e.g. 2 Year Manufacturer Warranty)"
                        value={productForm.warranty}
                        onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Return Policy"
                          value={productForm.return_policy}
                          onChange={(e) => setProductForm({ ...productForm, return_policy: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          placeholder="Return Days"
                          value={productForm.return_days}
                          onChange={(e) => setProductForm({ ...productForm, return_days: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Section 5 - Specifications */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Specifications</p>
                      <p className="text-xs text-muted-foreground">Enter each spec on a new line as Key: Value (e.g. Material: Microfiber)</p>
                      <textarea
                        placeholder="Material: Microfiber&#10;Size: 16x16 inches&#10;Pack: 6"
                        value={productForm.specifications}
                        onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                        className={`${inputClass} min-h-[100px] resize-none font-mono text-xs`}
                      />
                    </div>

                    {/* Section 6 - Inventory & Ratings */}
                    <div className="space-y-4">
                      <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">Inventory & Ratings</p>
                      <button
                        onClick={() => setProductForm({ ...productForm, in_stock: !productForm.in_stock })}
                        className="flex items-center gap-2 text-foreground"
                      >
                        {productForm.in_stock ? (
                          <ToggleRight size={28} className="text-primary" />
                        ) : (
                          <ToggleLeft size={28} className="text-muted-foreground" />
                        )}
                        <span>{productForm.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          placeholder="Rating (0-5)"
                          value={productForm.rating}
                          onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          placeholder="Reviews Count"
                          value={productForm.reviews_count}
                          onChange={(e) => setProductForm({ ...productForm, reviews_count: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-glass-border/30">
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-3 glass-card font-semibold rounded-lg hover:border-primary/50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProduct}
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        <Save size={18} />
                        {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No products. Add one!</p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className={`glass-card p-4 flex items-center gap-4 ${editingProduct === product.id ? 'border-primary/50' : ''}`}
                    >
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate text-base">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{product.category}</span>
                          <span>•</span>
                          <span>★ {product.rating} ({product.reviews_count})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => toggleStock(product.id, product.in_stock)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.in_stock ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.in_stock ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <p className="font-display font-bold text-primary text-lg w-24 text-right">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => startEditProduct(product)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Messages Tab */}
          {tab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => !message.read && markMessageRead(message.id)}
                    className={`glass-card p-5 cursor-pointer transition-colors ${
                      !message.read ? 'border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {!message.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                        <span className="text-sm font-medium text-foreground">{message.name}</span>
                        <span className="text-xs text-muted-foreground">&lt;{message.email}&gt;</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {message.subject && (
                      <p className="text-sm font-medium text-foreground mb-1">{message.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{message.message}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
