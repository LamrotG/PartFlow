import { createClient } from '@/lib/supabase/server'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/categories'
import { getBrands } from '@/lib/queries/brands'
import { ProductsPageContent } from '@/components/products-page-content'

export default async function ProductsPage() {
  const supabase = await createClient()
  const [products, categories, brands] = await Promise.all([
    getProducts(supabase),
    getCategories(supabase),
    getBrands(supabase),
  ])
  return <ProductsPageContent products={products} categories={categories} brands={brands} />
}
