'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useSession } from '@/components/session-provider'
import { createProductAction, updateProductAction } from '@/app/(dashboard)/products/actions'
import type { ProductWithDetails, Category, Brand } from '@/lib/types/database'

export function ProductsPageContent({
  products, categories, brands,
}: {
  products: ProductWithDetails[]
  categories: Category[]
  brands: Brand[]
}) {
  const { profile } = useSession()
  const isAdmin = profile?.role === 'admin'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null)

  const categoryNames = ['All', ...categories.map((c) => c.name)]

  let filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchesCategory = filterCategory === 'All' || p.categories?.name === filterCategory
    return matchesSearch && matchesCategory && p.is_active
  })

  return (
    <>
      <TopBar
        title="Products"
        searchPlaceholder="Search by name or SKU..."
        onSearch={setSearchQuery}
        actions={
          isAdmin ? (
            <Button onClick={() => { setEditingProduct(null); setShowForm(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="flex gap-2 flex-wrap">
            {categoryNames.map((cat) => (
              <button key={cat} type="button" onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'sku', label: 'SKU', width: 'w-28', render: (value) => <span className="font-mono text-sm text-primary">{value}</span> },
                { id: 'name', label: 'Name', render: (value) => <span className="font-medium text-foreground">{value}</span> },
                { id: 'categories', label: 'Category', width: 'w-28', render: (value) => <span className="text-sm text-muted-foreground">{value?.name || '—'}</span> },
                { id: 'brands', label: 'Brand', width: 'w-24', render: (value) => <span className="text-sm text-foreground">{value?.name || '—'}</span> },
                { id: 'unit_price', label: 'Price', width: 'w-24', render: (value) => <span className="font-semibold text-foreground">${Number(value).toFixed(2)}</span> },
                { id: 'inventory', label: 'Stock', width: 'w-24', render: (value) => {
                  const qty = value?.quantity_on_hand ?? 0
                  const reorder = value?.reorder_level ?? 0
                  const color = qty === 0 ? 'text-red-400' : qty <= reorder ? 'text-yellow-400' : 'text-green-400'
                  return <span className={`font-semibold ${color}`}>{qty}</span>
                }},
              ]}
              data={filtered}
              onRowClick={isAdmin ? (row) => { setEditingProduct(row); setShowForm(true) } : undefined}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

function ProductFormModal({
  product, categories, brands, onClose,
}: {
  product: ProductWithDetails | null
  categories: Category[]
  brands: Brand[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!product

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateProductAction(product!.id, formData)
        : await createProductAction(formData)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prodSku" className="block text-sm font-medium text-foreground mb-1">SKU *</label>
            <Input id="prodSku" name="sku" required defaultValue={product?.sku || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="prodName" className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <Input id="prodName" name="name" required defaultValue={product?.name || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="prodDesc" className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea id="prodDesc" name="description" defaultValue={product?.description || ''} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm min-h-[60px] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prodCategory" className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select id="prodCategory" name="category_id" aria-label="Category" defaultValue={product?.category_id || ''} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="prodBrand" className="block text-sm font-medium text-foreground mb-1">Brand</label>
              <select id="prodBrand" name="brand_id" aria-label="Brand" defaultValue={product?.brand_id || ''} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm">
                <option value="">None</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prodPrice" className="block text-sm font-medium text-foreground mb-1">Unit Price *</label>
              <Input id="prodPrice" name="unit_price" type="number" step="0.01" min="0" required defaultValue={product?.unit_price || ''} className="bg-secondary border-border" />
            </div>
            <div>
              <label htmlFor="prodCost" className="block text-sm font-medium text-foreground mb-1">Cost Price</label>
              <Input id="prodCost" name="cost_price" type="number" step="0.01" min="0" defaultValue={product?.cost_price || ''} className="bg-secondary border-border" />
            </div>
          </div>
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
