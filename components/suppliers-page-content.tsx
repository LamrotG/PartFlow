'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useSession } from '@/components/session-provider'
import { createSupplierAction, updateSupplierAction } from '@/app/(dashboard)/suppliers/actions'
import type { Supplier } from '@/lib/types/database'

export function SuppliersPageContent({ suppliers }: { suppliers: Supplier[] }) {
  const { profile } = useSession()
  const isAdmin = profile?.role === 'admin'
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const filtered = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase()
    return !searchQuery || s.name.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.contact_person?.toLowerCase().includes(q)
  })

  return (
    <>
      <TopBar
        title="Suppliers"
        searchPlaceholder="Search suppliers..."
        onSearch={setSearchQuery}
        actions={
          isAdmin ? (
            <Button onClick={() => { setEditingSupplier(null); setShowForm(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Supplier
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'name', label: 'Name', render: (value) => <span className="font-medium text-foreground">{value}</span> },
                { id: 'contact_person', label: 'Contact', render: (value) => <span className="text-sm text-foreground">{value || '—'}</span> },
                { id: 'email', label: 'Email', render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span> },
                { id: 'phone', label: 'Phone', width: 'w-32', render: (value) => <span className="text-sm text-foreground">{value || '—'}</span> },
                { id: 'address', label: 'Address', render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span> },
                { id: 'is_active', label: 'Status', width: 'w-24', render: (value) => <span className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{value ? 'Active' : 'Inactive'}</span> },
              ]}
              data={filtered}
              onRowClick={isAdmin ? (row) => { setEditingSupplier(row); setShowForm(true) } : undefined}
            />
          </div>
        </div>
      </div>

      {showForm && <SupplierFormModal supplier={editingSupplier} onClose={() => setShowForm(false)} />}
    </>
  )
}

function SupplierFormModal({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!supplier

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = isEdit ? await updateSupplierAction(supplier!.id, formData) : await createSupplierAction(formData)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div><label htmlFor="supName" className="block text-sm font-medium text-foreground mb-1">Name *</label><Input id="supName" name="name" required defaultValue={supplier?.name || ''} className="bg-secondary border-border" /></div>
          <div><label htmlFor="supContact" className="block text-sm font-medium text-foreground mb-1">Contact Person</label><Input id="supContact" name="contact_person" defaultValue={supplier?.contact_person || ''} className="bg-secondary border-border" /></div>
          <div><label htmlFor="supEmail" className="block text-sm font-medium text-foreground mb-1">Email</label><Input id="supEmail" name="email" type="email" defaultValue={supplier?.email || ''} className="bg-secondary border-border" /></div>
          <div><label htmlFor="supPhone" className="block text-sm font-medium text-foreground mb-1">Phone</label><Input id="supPhone" name="phone" defaultValue={supplier?.phone || ''} className="bg-secondary border-border" /></div>
          <div><label htmlFor="supAddress" className="block text-sm font-medium text-foreground mb-1">Address</label><Input id="supAddress" name="address" defaultValue={supplier?.address || ''} className="bg-secondary border-border" /></div>
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">{isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Supplier'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
