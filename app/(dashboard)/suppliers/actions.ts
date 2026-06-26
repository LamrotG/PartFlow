'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSupplier, updateSupplier } from '@/lib/queries/suppliers'

export async function createSupplierAction(formData: FormData) {
  const supabase = await createClient()
  try {
    await createSupplier(supabase, {
      name: formData.get('name') as string,
      contact_person: (formData.get('contact_person') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create supplier' }
  }
}

export async function updateSupplierAction(id: string, formData: FormData) {
  const supabase = await createClient()
  try {
    await updateSupplier(supabase, id, {
      name: formData.get('name') as string,
      contact_person: (formData.get('contact_person') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update supplier' }
  }
}
