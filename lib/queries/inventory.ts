import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, InventoryWithProduct } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getInventory(supabase: Client) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(*, categories(*), brands(*))')
    .order('quantity_on_hand', { ascending: true })

  if (error) throw error
  return (data || []) as InventoryWithProduct[]
}

export async function adjustInventory(
  supabase: Client,
  productId: string,
  adjustment: number,
  note: string,
  userId: string
) {
  const { data: inv } = await supabase
    .from('inventory')
    .select('quantity_on_hand')
    .eq('product_id', productId)
    .single()

  if (!inv) throw new Error('Inventory record not found')

  const newQty = Math.max(0, inv.quantity_on_hand + adjustment)

  const { error } = await supabase
    .from('inventory')
    .update({
      quantity_on_hand: newQty,
      last_restocked_at: adjustment > 0 ? new Date().toISOString() : undefined,
    })
    .eq('product_id', productId)

  if (error) throw error

  await supabase.from('stock_movements').insert({
    product_id: productId,
    type: 'adjustment',
    quantity: adjustment,
    note,
    created_by: userId,
  })
}
