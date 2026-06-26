'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { adjustInventory } from '@/lib/queries/inventory'

export async function adjustInventoryAction(productId: string, adjustment: number, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await adjustInventory(supabase, productId, adjustment, note, user.id)
    revalidatePath('/inventory')
    revalidatePath('/products')
    revalidatePath('/')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to adjust inventory' }
  }
}
