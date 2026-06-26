'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSale, type CreateSaleInput } from '@/lib/queries/sales'

export async function createSaleAction(input: Omit<CreateSaleInput, 'employee_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const order = await createSale(supabase, {
      ...input,
      employee_id: user.id,
    })
    revalidatePath('/sales')
    revalidatePath('/')
    revalidatePath('/inventory')
    return { data: order }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create sale'
    return { error: message }
  }
}
