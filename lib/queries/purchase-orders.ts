import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, PurchaseOrderWithDetails } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getPurchaseOrders(supabase: Client) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, suppliers(*), profiles(*), purchase_order_items(*, products(*))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as PurchaseOrderWithDetails[]
}

export interface CreatePOInput {
  supplier_id: string
  ordered_by: string
  expected_delivery_date?: string
  notes?: string
  items: {
    product_id: string
    quantity_ordered: number
    unit_cost: number
  }[]
}

export async function createPurchaseOrder(supabase: Client, input: CreatePOInput) {
  const total_amount = input.items.reduce(
    (sum, item) => sum + item.quantity_ordered * item.unit_cost,
    0
  )

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: input.supplier_id,
      ordered_by: input.ordered_by,
      total_amount,
      expected_delivery_date: input.expected_delivery_date,
      notes: input.notes,
    })
    .select()
    .single()

  if (poError) throw poError

  const poItems = input.items.map((item) => ({
    purchase_order_id: po.id,
    product_id: item.product_id,
    quantity_ordered: item.quantity_ordered,
    unit_cost: item.unit_cost,
  }))

  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(poItems)

  if (itemsError) throw itemsError

  return po
}

export async function receivePurchaseOrder(
  supabase: Client,
  id: string,
  userId: string
) {
  const { data: po } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(*)')
    .eq('id', id)
    .single()

  if (!po) throw new Error('Purchase order not found')
  if (po.status === 'received') throw new Error('Already received')

  // Update PO status
  const { error } = await supabase
    .from('purchase_orders')
    .update({ status: 'received', received_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  // Update inventory for each item
  for (const item of po.purchase_order_items) {
    // Mark items as received
    await supabase
      .from('purchase_order_items')
      .update({ quantity_received: item.quantity_ordered })
      .eq('id', item.id)

    // Increment inventory
    const { data: inv } = await supabase
      .from('inventory')
      .select('quantity_on_hand')
      .eq('product_id', item.product_id)
      .single()

    if (inv) {
      await supabase
        .from('inventory')
        .update({
          quantity_on_hand: inv.quantity_on_hand + item.quantity_ordered,
          last_restocked_at: new Date().toISOString(),
        })
        .eq('product_id', item.product_id)
    }

    // Record stock movement
    await supabase.from('stock_movements').insert({
      product_id: item.product_id,
      purchase_order_id: id,
      type: 'purchase',
      quantity: item.quantity_ordered,
      note: `PO ${po.po_number} received`,
      created_by: userId,
    })
  }
}

export async function updatePOStatus(
  supabase: Client,
  id: string,
  status: 'draft' | 'submitted' | 'cancelled'
) {
  const { error } = await supabase
    .from('purchase_orders')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}
