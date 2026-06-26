import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Customer } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getCustomers(supabase: Client) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getCustomersWithMetrics(supabase: Client) {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) throw error

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, total_amount, remaining_amount, created_at')

  const metrics = new Map<
    string,
    { totalPurchased: number; totalOutstanding: number; transactionCount: number; lastPurchase: string | null }
  >()

  for (const order of orders || []) {
    if (!order.customer_id) continue
    const existing = metrics.get(order.customer_id) || {
      totalPurchased: 0,
      totalOutstanding: 0,
      transactionCount: 0,
      lastPurchase: null,
    }
    existing.totalPurchased += Number(order.total_amount)
    existing.totalOutstanding += Number(order.remaining_amount)
    existing.transactionCount++
    if (!existing.lastPurchase || order.created_at > existing.lastPurchase) {
      existing.lastPurchase = order.created_at
    }
    metrics.set(order.customer_id, existing)
  }

  return (customers || []).map((c) => ({
    ...c,
    ...(metrics.get(c.id) || {
      totalPurchased: 0,
      totalOutstanding: 0,
      transactionCount: 0,
      lastPurchase: null,
    }),
  }))
}

export async function createCustomer(
  supabase: Client,
  data: Database['public']['Tables']['customers']['Insert']
) {
  const { data: customer, error } = await supabase
    .from('customers')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return customer
}

export async function updateCustomer(
  supabase: Client,
  id: string,
  data: Database['public']['Tables']['customers']['Update']
) {
  const { error } = await supabase.from('customers').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteCustomer(supabase: Client, id: string) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}
