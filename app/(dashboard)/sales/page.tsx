import { createClient } from '@/lib/supabase/server'
import { getSales } from '@/lib/queries/sales'
import { getCustomers } from '@/lib/queries/customers'
import { getActiveProducts } from '@/lib/queries/products'
import { SalesPageContent } from '@/components/sales-page-content'

export default async function SalesPage() {
  const supabase = await createClient()

  const [sales, customers, products] = await Promise.all([
    getSales(supabase),
    getCustomers(supabase),
    getActiveProducts(supabase),
  ])

  return (
    <SalesPageContent
      sales={sales}
      customers={customers}
      products={products}
    />
  )
}
