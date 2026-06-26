import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getEmployeePerformance(supabase: Client, limit = 8) {
  const { data: orders } = await supabase
    .from('orders')
    .select('employee_id, total_amount, profiles(full_name)')

  const empMap = new Map<string, { name: string; sales: number; count: number }>()
  for (const order of orders || []) {
    const profile = order.profiles as { full_name: string } | null
    const existing = empMap.get(order.employee_id) || {
      name: profile?.full_name || 'Unknown',
      sales: 0,
      count: 0,
    }
    existing.sales += Number(order.total_amount)
    existing.count++
    empMap.set(order.employee_id, existing)
  }

  return Array.from(empMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit)
}

export async function getTopCustomers(supabase: Client, limit = 8) {
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, total_amount, customers(name)')

  const custMap = new Map<string, { name: string; spent: number; count: number }>()
  for (const order of orders || []) {
    if (!order.customer_id) continue
    const customer = order.customers as { name: string } | null
    const existing = custMap.get(order.customer_id) || {
      name: customer?.name || 'Unknown',
      spent: 0,
      count: 0,
    }
    existing.spent += Number(order.total_amount)
    existing.count++
    custMap.set(order.customer_id, existing)
  }

  return Array.from(custMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit)
}

export async function getWeeklySalesTrend(supabase: Client) {
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .order('created_at', { ascending: true })

  const weeks = new Map<string, number>()
  for (const order of orders || []) {
    const date = new Date(order.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toLocaleDateString()
    weeks.set(key, (weeks.get(key) || 0) + Number(order.total_amount))
  }

  return Array.from(weeks.entries())
    .map(([week, total]) => ({ week, amount: Math.round(total) }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
    .slice(-8)
}

export async function getPaymentMethodBreakdown(supabase: Client) {
  const { data: orders } = await supabase
    .from('orders')
    .select('payment_method, total_amount')

  const methods = new Map<string, number>()
  for (const order of orders || []) {
    const method = order.payment_method
    methods.set(method, (methods.get(method) || 0) + Number(order.total_amount))
  }

  return Array.from(methods.entries())
    .map(([name, amount]) => ({ name, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount)
}
