'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Trash2 } from 'lucide-react'
import { useSession } from '@/components/session-provider'
import { createPOAction, receivePOAction } from '@/app/(dashboard)/purchase-orders/actions'
import type { PurchaseOrderWithDetails, Supplier } from '@/lib/types/database'

interface POProduct { id: string; sku: string; name: string; unit_price: number }

export function PurchaseOrdersPageContent({
  purchaseOrders, suppliers, products,
}: {
  purchaseOrders: PurchaseOrderWithDetails[]
  suppliers: Supplier[]
  products: POProduct[]
}) {
  const { profile } = useSession()
  const isAdmin = profile?.role === 'admin'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = purchaseOrders.filter((po) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || po.po_number.toLowerCase().includes(q) || po.suppliers.name.toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'All' || po.status === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  function handleReceive(id: string) {
    if (!confirm('Mark this PO as received? This will update inventory.')) return
    startTransition(async () => { await receivePOAction(id) })
  }

  return (
    <>
      <TopBar
        title="Purchase Orders"
        searchPlaceholder="Search by PO number or supplier..."
        onSearch={setSearchQuery}
        actions={
          isAdmin ? (
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" /> New PO
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="flex gap-2">
            {['All', 'Draft', 'Submitted', 'Received', 'Cancelled'].map((status) => (
              <button key={status} type="button" onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'po_number', label: 'PO Number', width: 'w-28', render: (value) => <span className="font-mono text-sm text-primary">{value}</span> },
                { id: 'suppliers', label: 'Supplier', render: (value) => <span className="font-medium text-foreground">{(value as Supplier).name}</span> },
                { id: 'status', label: 'Status', width: 'w-24', render: (value) => {
                  const colors: Record<string, string> = { draft: 'bg-secondary text-foreground', submitted: 'bg-blue-500/20 text-blue-400', received: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' }
                  return <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[value] || ''}`}>{value}</span>
                }},
                { id: 'total_amount', label: 'Total', width: 'w-24', render: (value) => <span className="font-semibold text-foreground">${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> },
                { id: 'expected_delivery_date', label: 'Expected', width: 'w-28', render: (value) => value ? <span className="text-sm text-muted-foreground">{new Date(value).toLocaleDateString()}</span> : <span className="text-sm text-muted-foreground">—</span> },
                { id: 'created_at', label: 'Created', width: 'w-28', render: (value) => <span className="text-sm text-muted-foreground">{new Date(value).toLocaleDateString()}</span> },
                ...(isAdmin ? [{
                  id: 'id' as const,
                  label: 'Action',
                  width: 'w-24' as const,
                  render: (value: string, row: PurchaseOrderWithDetails) => row.status === 'submitted' ? (
                    <Button type="button" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleReceive(value) }} disabled={isPending}>
                      Receive
                    </Button>
                  ) : null,
                }] : []),
              ]}
              data={filtered}
            />
          </div>
        </div>
      </div>

      {showForm && <POFormModal suppliers={suppliers} products={products} onClose={() => setShowForm(false)} />}
    </>
  )
}

function POFormModal({ suppliers, products, onClose }: { suppliers: Supplier[]; products: POProduct[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<{ product_id: string; name: string; quantity_ordered: number; unit_cost: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [cost, setCost] = useState(0)

  function addItem() {
    if (!selectedProduct || qty <= 0) return
    const p = products.find((pr) => pr.id === selectedProduct)
    if (!p) return
    setItems([...items, { product_id: p.id, name: p.name, quantity_ordered: qty, unit_cost: cost || p.unit_price }])
    setSelectedProduct('')
    setQty(1)
    setCost(0)
  }

  function handleSubmit() {
    if (!supplierId || items.length === 0) { setError('Select a supplier and add items'); return }
    setError(null)
    startTransition(async () => {
      const result = await createPOAction({
        supplier_id: supplierId,
        expected_delivery_date: deliveryDate || undefined,
        notes: notes || undefined,
        items: items.map((i) => ({ product_id: i.product_id, quantity_ordered: i.quantity_ordered, unit_cost: i.unit_cost })),
      })
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  const total = items.reduce((sum, i) => sum + i.quantity_ordered * i.unit_cost, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">New Purchase Order</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="poSupplier" className="block text-sm font-medium text-foreground mb-1">Supplier *</label>
              <select id="poSupplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} aria-label="Supplier" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm">
                <option value="">Select supplier...</option>
                {suppliers.filter((s) => s.is_active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="poDate" className="block text-sm font-medium text-foreground mb-1">Expected Delivery</label>
              <Input id="poDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">Items</h3>
            <div className="grid grid-cols-5 gap-2 mb-3">
              <select value={selectedProduct} onChange={(e) => { setSelectedProduct(e.target.value); const p = products.find((pr) => pr.id === e.target.value); if (p) setCost(p.unit_price) }} aria-label="Product" className="col-span-2 bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm">
                <option value="">Select product...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} min="1" placeholder="Qty" className="bg-secondary border-border text-sm" />
              <Input type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} step="0.01" min="0" placeholder="Cost" className="bg-secondary border-border text-sm" />
              <Button type="button" onClick={addItem} variant="outline" size="sm"><Plus className="w-4 h-4" /></Button>
            </div>
            {items.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary border-b border-border">
                    <tr><th className="px-4 py-2 text-left text-foreground font-semibold">Product</th><th className="px-4 py-2 text-right text-foreground font-semibold">Qty</th><th className="px-4 py-2 text-right text-foreground font-semibold">Cost</th><th className="px-4 py-2 text-right text-foreground font-semibold">Total</th><th className="px-4 py-2 w-10"><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-4 py-2 text-foreground">{item.name}</td>
                        <td className="px-4 py-2 text-right text-foreground">{item.quantity_ordered}</td>
                        <td className="px-4 py-2 text-right text-foreground">${item.unit_cost.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-foreground">${(item.quantity_ordered * item.unit_cost).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-600" title="Remove"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-right text-sm text-foreground mt-2">Total: <span className="font-bold">${total.toFixed(2)}</span></p>
          </div>

          <div>
            <label htmlFor="poNotes" className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea id="poNotes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm min-h-[60px] resize-none" />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">{isPending ? 'Creating...' : 'Create PO'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
