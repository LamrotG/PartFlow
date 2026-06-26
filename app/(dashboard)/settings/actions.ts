'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.get('fullName') as string,
        phone: (formData.get('phone') as string) || null,
      })
      .eq('id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/settings')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update profile' }
  }
}

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}
