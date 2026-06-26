import { createClient } from '@/lib/supabase/server'
import { getPurchaseOrders } from '@/lib/queries/purchase-orders'
import { getSuppliers } from '@/lib/queries/suppliers'
import { getActiveProducts } from '@/lib/queries/products'
import { PurchaseOrdersPageContent } from '@/components/purchase-orders-page-content'

export default async function PurchaseOrdersPage() {
  const supabase = await createClient()
  const [purchaseOrders, suppliers, products] = await Promise.all([
    getPurchaseOrders(supabase),
    getSuppliers(supabase),
    getActiveProducts(supabase),
  ])
  return <PurchaseOrdersPageContent purchaseOrders={purchaseOrders} suppliers={suppliers} products={products} />
}
