'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createProduct, updateProduct, deleteProduct } from '@/lib/queries/products'

export async function createProductAction(formData: FormData) {
  const supabase = await createClient()
  try {
    await createProduct(supabase, {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category_id: (formData.get('category_id') as string) || null,
      brand_id: (formData.get('brand_id') as string) || null,
      unit_price: parseFloat(formData.get('unit_price') as string),
      cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null,
    })
    revalidatePath('/products')
    revalidatePath('/inventory')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create product' }
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient()
  try {
    await updateProduct(supabase, id, {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category_id: (formData.get('category_id') as string) || null,
      brand_id: (formData.get('brand_id') as string) || null,
      unit_price: parseFloat(formData.get('unit_price') as string),
      cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null,
    })
    revalidatePath('/products')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update product' }
  }
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  try {
    await deleteProduct(supabase, id)
    revalidatePath('/products')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to delete product' }
  }
}
