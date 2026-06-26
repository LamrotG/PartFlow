import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuditLogs } from '@/lib/queries/audit-logs'
import { AuditLogsPageContent } from '@/components/audit-logs-page-content'

export default async function AuditLogsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const logs = await getAuditLogs(supabase)
  return <AuditLogsPageContent logs={logs} />
}
