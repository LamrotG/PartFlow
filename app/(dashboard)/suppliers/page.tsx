import { createClient } from '@/lib/supabase/server'
import { getSuppliers } from '@/lib/queries/suppliers'
import { SuppliersPageContent } from '@/components/suppliers-page-content'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const suppliers = await getSuppliers(supabase)
  return <SuppliersPageContent suppliers={suppliers} />
}
