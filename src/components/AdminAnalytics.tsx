import { useMemo } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Package } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AdminAnalyticsProps {
  orders: any[]
  products: any[]
}

const COLORS = [
  'hsl(190,100%,50%)',
  'hsl(260,70%,60%)',
  'hsl(180,100%,60%)',
  'hsl(0,84%,60%)',
  'hsl(45,100%,50%)',
]

export function AdminAnalytics({ orders, products }: AdminAnalyticsProps) {
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0

    const revenueByMonthMap = new Map<string, number>()
    orders.forEach((order) => {
      const date = new Date(order.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + Number(order.total || 0))
    })

    const revenueByMonth = Array.from(revenueByMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, revenue]) => {
        const [year, month] = key.split('-')
        const date = new Date(Number(year), Number(month) - 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue,
        }
      })

    const statusCount = new Map<string, number>()
    orders.forEach((order) => {
      statusCount.set(order.status, (statusCount.get(order.status) || 0) + 1)
    })
    const ordersByStatus = Array.from(statusCount.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    const categoryCount = new Map<string, number>()
    products.forEach((product) => {
      categoryCount.set(product.category, (categoryCount.get(product.category) || 0) + 1)
    })
    const productsByCategory = Array.from(categoryCount.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyOrdersMap = new Map<string, number>()
    orders
      .filter((order) => new Date(order.created_at) >= thirtyDaysAgo)
      .forEach((order) => {
        const date = new Date(order.created_at)
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        dailyOrdersMap.set(key, (dailyOrdersMap.get(key) || 0) + 1)
      })

    const dailyOrders = Array.from(dailyOrdersMap.entries()).map(([day, count]) => ({
      day,
      count,
    }))

    return {
      totalRevenue,
      avgOrder,
      revenueByMonth,
      ordersByStatus,
      productsByCategory,
      dailyOrders,
    }
  }, [orders, products])

  const kpiCards = [
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
    { icon: ShoppingBag, label: 'Total Orders', value: orders.length.toString() },
    { icon: TrendingUp, label: 'Avg Order Value', value: `$${stats.avgOrder.toFixed(2)}` },
    { icon: Package, label: 'Products', value: products.length.toString() },
  ]

  const tooltipStyle = {
    backgroundColor: 'hsl(220,20%,8%)',
    border: '1px solid hsl(220,15%,25%)',
    borderRadius: 8,
    color: 'hsl(210,40%,95%)',
  }

  if (orders.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">
          No order data yet. Analytics will appear once orders start coming in.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="glass-card p-5">
              <Icon size={20} className="text-primary mb-2" />
              <p className="font-display text-xl font-bold text-primary neon-text">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {card.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Revenue Bar Chart */}
      {stats.revenueByMonth.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.revenueByMonth}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(190,100%,50%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Two-column charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders by Status (Pie) */}
        {stats.ordersByStatus.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">
              Orders by Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {stats.ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Orders Trend (Line) */}
        {stats.dailyOrders.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-display text-sm tracking-widest uppercase text-muted-foreground mb-4">
              Daily Orders Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyOrders}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(260,70%,60%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(260,70%,60%)', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
