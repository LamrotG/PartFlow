'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPurchaseOrder, receivePurchaseOrder, updatePOStatus, type CreatePOInput } from '@/lib/queries/purchase-orders'

export async function createPOAction(input: Omit<CreatePOInput, 'ordered_by'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await createPurchaseOrder(supabase, { ...input, ordered_by: user.id })
    revalidatePath('/purchase-orders')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create PO' }
  }
}

export async function receivePOAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await receivePurchaseOrder(supabase, id, user.id)
    revalidatePath('/purchase-orders')
    revalidatePath('/inventory')
    revalidatePath('/')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to receive PO' }
  }
}

export async function updatePOStatusAction(id: string, status: 'draft' | 'submitted' | 'cancelled') {
  const supabase = await createClient()
  try {
    await updatePOStatus(supabase, id, status)
    revalidatePath('/purchase-orders')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update PO' }
  }
}
