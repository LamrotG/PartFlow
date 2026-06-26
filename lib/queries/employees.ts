import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Profile } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getEmployees(supabase: Client) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) throw error
  return data || []
}

export async function getEmployeesWithMetrics(supabase: Client) {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) throw error

  const { data: orders } = await supabase
    .from('orders')
    .select('employee_id, total_amount')

  const metrics = new Map<
    string,
    { totalSalesAmount: number; transactionCount: number }
  >()

  for (const order of orders || []) {
    const existing = metrics.get(order.employee_id) || {
      totalSalesAmount: 0,
      transactionCount: 0,
    }
    existing.totalSalesAmount += Number(order.total_amount)
    existing.transactionCount++
    metrics.set(order.employee_id, existing)
  }

  return (profiles || []).map((p) => {
    const m = metrics.get(p.id) || { totalSalesAmount: 0, transactionCount: 0 }
    return {
      ...p,
      totalSalesAmount: m.totalSalesAmount,
      transactionCount: m.transactionCount,
      avgTransactionValue:
        m.transactionCount > 0 ? m.totalSalesAmount / m.transactionCount : 0,
    }
  })
}

export async function updateEmployee(
  supabase: Client,
  id: string,
  data: Database['public']['Tables']['profiles']['Update']
) {
  const { error } = await supabase.from('profiles').update(data).eq('id', id)
  if (error) throw error
}

export async function toggleEmployeeActive(supabase: Client, id: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !profile.is_active })
    .eq('id', id)

  if (error) throw error
}
