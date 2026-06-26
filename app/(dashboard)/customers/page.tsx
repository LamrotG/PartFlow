import { createClient } from '@/lib/supabase/server'
import { getCustomersWithMetrics } from '@/lib/queries/customers'
import { CustomersPageContent } from '@/components/customers-page-content'

export default async function CustomersPage() {
  const supabase = await createClient()
  const customers = await getCustomersWithMetrics(supabase)
  return <CustomersPageContent customers={customers} />
}
