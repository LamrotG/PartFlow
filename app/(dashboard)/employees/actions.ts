'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateEmployee, toggleEmployeeActive } from '@/lib/queries/employees'

export async function createEmployeeAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const serviceClient = await createServiceClient()
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = (formData.get('role') as string) || 'employee'
    const department = (formData.get('department') as string) || null

    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    })

    if (authError) return { error: authError.message }

    if (department && authUser.user) {
      await serviceClient
        .from('profiles')
        .update({ department })
        .eq('id', authUser.user.id)
    }

    revalidatePath('/employees')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create employee' }
  }
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  const supabase = await createClient()
  try {
    await updateEmployee(supabase, id, {
      full_name: formData.get('fullName') as string,
      department: (formData.get('department') as string) || null,
      phone: (formData.get('phone') as string) || null,
    })
    revalidatePath('/employees')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update employee' }
  }
}

export async function toggleEmployeeActiveAction(id: string) {
  const supabase = await createClient()
  try {
    await toggleEmployeeActive(supabase, id)
    revalidatePath('/employees')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update employee status' }
  }
}
