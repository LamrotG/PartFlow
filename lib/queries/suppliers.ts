import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getSuppliers(supabase: Client) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createSupplier(
  supabase: Client,
  data: Database['public']['Tables']['suppliers']['Insert']
) {
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return supplier
}

export async function updateSupplier(
  supabase: Client,
  id: string,
  data: Database['public']['Tables']['suppliers']['Update']
) {
  const { error } = await supabase.from('suppliers').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteSupplier(supabase: Client, id: string) {
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}
