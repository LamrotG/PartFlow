import { createClient } from '@/lib/supabase/server'
import { getInventory } from '@/lib/queries/inventory'
import { InventoryPageContent } from '@/components/inventory-page-content'

export default async function InventoryPage() {
  const supabase = await createClient()
  const inventory = await getInventory(supabase)
  return <InventoryPageContent inventory={inventory} />
}
