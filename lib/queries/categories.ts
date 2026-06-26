import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getCategories(supabase: Client) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createCategory(
  supabase: Client,
  data: Database['public']['Tables']['categories']['Insert']
) {
  const { data: category, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return category
}
