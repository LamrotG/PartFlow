'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useSession } from '@/components/session-provider'
import { createCustomerAction, updateCustomerAction } from '@/app/(dashboard)/customers/actions'
import type { Customer } from '@/lib/types/database'

type CustomerWithMetrics = Customer & {
  totalPurchased: number
  totalOutstanding: number
  transactionCount: number
  lastPurchase: string | null
}

export function CustomersPageContent({ customers }: { customers: CustomerWithMetrics[] }) {
  const { profile } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  let filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase()
    return !searchQuery || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)
  })

  if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy === 'totalPurchased') filtered.sort((a, b) => b.totalPurchased - a.totalPurchased)

  return (
    <>
      <TopBar
        title="Customers"
        searchPlaceholder="Search by name, email, or phone..."
        onSearch={setSearchQuery}
        actions={
          <Button onClick={() => { setEditingCustomer(null); setShowForm(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-foreground">{customers.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">
                ${customers.reduce((sum, c) => sum + c.totalPurchased, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Outstanding Balance</p>
              <p className="text-3xl font-bold text-yellow-400">
                ${customers.reduce((sum, c) => sum + c.totalOutstanding, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'name', label: 'Name', sortable: true, render: (value) => <span className="font-medium text-foreground">{value}</span> },
                { id: 'email', label: 'Email', render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span> },
                { id: 'phone', label: 'Phone', width: 'w-32', render: (value) => <span className="text-sm text-foreground">{value || '—'}</span> },
                { id: 'address', label: 'Address', render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span> },
                { id: 'transactionCount', label: 'Sales', width: 'w-20', sortable: true, render: (value) => <span className="text-sm font-semibold text-foreground">{value}</span> },
                { id: 'totalPurchased', label: 'Total Purchased', width: 'w-32', sortable: true, render: (value) => <span className="font-semibold text-foreground">${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> },
                { id: 'totalOutstanding', label: 'Outstanding', width: 'w-28', render: (value) => <span className={Number(value) > 0 ? 'text-yellow-400 font-semibold' : 'text-green-400'}>${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> },
                { id: 'lastPurchase', label: 'Last Purchase', width: 'w-28', render: (value) => value ? <span className="text-sm text-muted-foreground">{new Date(value).toLocaleDateString()}</span> : <span className="text-sm text-muted-foreground">N/A</span> },
              ]}
              data={filtered}
              sortBy={sortBy}
              onSort={(col) => setSortBy(col === sortBy ? 'name' : col)}
              onRowClick={(row) => { setEditingCustomer(row); setShowForm(true) }}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

function CustomerFormModal({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!customer

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateCustomerAction(customer!.id, formData)
        : await createCustomerAction(formData)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <Input id="name" name="name" required defaultValue={customer?.name || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input id="email" name="email" type="email" defaultValue={customer?.email || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <Input id="phone" name="phone" defaultValue={customer?.phone || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">Address</label>
            <Input id="address" name="address" defaultValue={customer?.address || ''} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea id="notes" name="notes" defaultValue={customer?.notes || ''} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm min-h-[60px] resize-none" />
          </div>
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
