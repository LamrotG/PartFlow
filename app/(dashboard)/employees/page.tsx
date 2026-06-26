import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeesWithMetrics } from '@/lib/queries/employees'
import { EmployeesPageContent } from '@/components/employees-page-content'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const employees = await getEmployeesWithMetrics(supabase)
  return <EmployeesPageContent employees={employees} />
}
