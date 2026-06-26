import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, ProductWithDetails } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getProducts(supabase: Client) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), brands(*), inventory(*)')
    .order('name')

  if (error) throw error
  return (data || []) as ProductWithDetails[]
}

export async function getActiveProducts(supabase: Client) {
  const { data, error } = await supabase
    .from('products')
    .select('id, sku, name, unit_price')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createProduct(
  supabase: Client,
  data: Database['public']['Tables']['products']['Insert']
) {
  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  // Create inventory record
  await supabase.from('inventory').insert({ product_id: product.id })

  return product
}

export async function updateProduct(
  supabase: Client,
  id: string,
  data: Database['public']['Tables']['products']['Update']
) {
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(supabase: Client, id: string) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}
