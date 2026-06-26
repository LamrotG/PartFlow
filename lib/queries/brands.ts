import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getBrands(supabase: Client) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createBrand(
  supabase: Client,
  data: Database['public']['Tables']['brands']['Insert']
) {
  const { data: brand, error } = await supabase
    .from('brands')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return brand
}
