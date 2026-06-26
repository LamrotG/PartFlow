import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, OrderWithDetails } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getSales(supabase: Client) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), profiles(*), order_items(*, products(*))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as OrderWithDetails[]
}

export async function getSaleById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), profiles(*), order_items(*, products(*))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as OrderWithDetails
}

export interface CreateSaleInput {
  customer_id: string | null
  employee_id: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
  }[]
  paid_amount: number
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'credit'
  notes?: string
}

export async function createSale(supabase: Client, input: CreateSaleInput) {
  const total_amount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )
  const payment_status =
    input.paid_amount >= total_amount
      ? 'paid'
      : input.paid_amount > 0
        ? 'partial'
        : 'unpaid'

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: input.customer_id,
      employee_id: input.employee_id,
      total_amount,
      paid_amount: input.paid_amount,
      payment_status,
      payment_method: input.payment_method,
      notes: input.notes,
    })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  // Decrement inventory for each item
  for (const item of input.items) {
    const { data: inv } = await supabase
      .from('inventory')
      .select('quantity_on_hand')
      .eq('product_id', item.product_id)
      .single()

    if (inv) {
      await supabase
        .from('inventory')
        .update({
          quantity_on_hand: Math.max(0, inv.quantity_on_hand - item.quantity),
        })
        .eq('product_id', item.product_id)
    }

    await supabase.from('stock_movements').insert({
      product_id: item.product_id,
      order_id: order.id,
      type: 'sale',
      quantity: -item.quantity,
      note: `Sale ${order.order_number}`,
      created_by: input.employee_id,
    })
  }

  return order
}

export async function updateSalePayment(
  supabase: Client,
  id: string,
  paid_amount: number
) {
  const { data: order } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('id', id)
    .single()

  if (!order) throw new Error('Order not found')

  const payment_status =
    paid_amount >= Number(order.total_amount)
      ? 'paid'
      : paid_amount > 0
        ? 'partial'
        : 'unpaid'

  const { error } = await supabase
    .from('orders')
    .update({ paid_amount, payment_status })
    .eq('id', id)

  if (error) throw error
}
