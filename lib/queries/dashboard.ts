import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getDashboardStats(supabase: Client) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [todayOrders, monthOrders, allOrders, productCount, customerCount, lowStock] =
    await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, paid_amount')
        .gte('created_at', todayStart),
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', monthStart),
      supabase
        .from('orders')
        .select('remaining_amount'),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('inventory')
        .select('id, quantity_on_hand, reorder_level')
        .filter('quantity_on_hand', 'lte', 'reorder_level' as never),
    ])

  const todayRevenue = (todayOrders.data || []).reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  )
  const todayTransactions = todayOrders.data?.length || 0
  const monthlyRevenue = (monthOrders.data || []).reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  )
  const outstandingBalance = (allOrders.data || []).reduce(
    (sum, o) => sum + Number(o.remaining_amount),
    0
  )

  // Low stock: manually filter since .lte on column reference doesn't work directly
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select('id, quantity_on_hand, reorder_level')
  const lowStockCount = (inventoryData || []).filter(
    (i) => i.quantity_on_hand <= i.reorder_level
  ).length

  return {
    todayRevenue,
    todayTransactions,
    monthlyRevenue,
    outstandingBalance,
    totalProducts: productCount.count || 0,
    totalCustomers: customerCount.count || 0,
    lowStockItems: lowStockCount,
  }
}

export async function getRevenueTrend(supabase: Client, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  const dailyMap = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap.set(key, 0)
  }

  for (const order of orders || []) {
    const d = new Date(order.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(order.total_amount))
  }

  return Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue),
  }))
}

export async function getPaymentStatusBreakdown(supabase: Client) {
  const { data: orders } = await supabase
    .from('orders')
    .select('payment_status')

  const breakdown = { Paid: 0, Partial: 0, Unpaid: 0 }
  for (const order of orders || []) {
    const key =
      order.payment_status === 'paid'
        ? 'Paid'
        : order.payment_status === 'partial'
          ? 'Partial'
          : 'Unpaid'
    breakdown[key]++
  }
  return breakdown
}

export async function getRecentSales(supabase: Client, limit = 10) {
  const { data } = await supabase
    .from('orders')
    .select('*, customers(*), profiles(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function getTopSellingProducts(supabase: Client, limit = 5) {
  const { data } = await supabase
    .from('order_items')
    .select('product_id, quantity, unit_price, products(name, sku)')

  const productMap = new Map<string, { name: string; sku: string; totalQty: number; totalRevenue: number }>()
  for (const item of data || []) {
    const existing = productMap.get(item.product_id)
    const product = item.products as { name: string; sku: string } | null
    if (existing) {
      existing.totalQty += item.quantity
      existing.totalRevenue += item.quantity * Number(item.unit_price)
    } else {
      productMap.set(item.product_id, {
        name: product?.name || 'Unknown',
        sku: product?.sku || '',
        totalQty: item.quantity,
        totalRevenue: item.quantity * Number(item.unit_price),
      })
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit)
}

export async function getLowStockItems(supabase: Client, limit = 5) {
  const { data } = await supabase
    .from('inventory')
    .select('*, products(name, sku)')
    .order('quantity_on_hand', { ascending: true })
    .limit(limit)

  return (data || []).filter((i) => i.quantity_on_hand <= i.reorder_level)
}
