import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

export async function getAuditLogs(supabase: Client, limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
