'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/queries/customers'

export async function createCustomerAction(formData: FormData) {
  const supabase = await createClient()
  try {
    await createCustomer(supabase, {
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    revalidatePath('/customers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create customer' }
  }
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const supabase = await createClient()
  try {
    await updateCustomer(supabase, id, {
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    revalidatePath('/customers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update customer' }
  }
}

export async function deleteCustomerAction(id: string) {
  const supabase = await createClient()
  try {
    await deleteCustomer(supabase, id)
    revalidatePath('/customers')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to delete customer' }
  }
}
