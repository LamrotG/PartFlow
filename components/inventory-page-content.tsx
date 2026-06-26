'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { adjustInventoryAction } from '@/app/(dashboard)/inventory/actions'
import type { InventoryWithProduct } from '@/lib/types/database'

export function InventoryPageContent({ inventory }: { inventory: InventoryWithProduct[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [adjustItem, setAdjustItem] = useState<InventoryWithProduct | null>(null)

  let filtered = inventory.filter((item) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || item.products.name.toLowerCase().includes(q) || item.products.sku.toLowerCase().includes(q)

    let matchesStatus = true
    if (filterStatus === 'Low') matchesStatus = item.quantity_on_hand > 0 && item.quantity_on_hand <= item.reorder_level
    else if (filterStatus === 'Out') matchesStatus = item.quantity_on_hand === 0
    else if (filterStatus === 'OK') matchesStatus = item.quantity_on_hand > item.reorder_level

    return matchesSearch && matchesStatus
  })

  const lowCount = inventory.filter((i) => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_level).length
  const outCount = inventory.filter((i) => i.quantity_on_hand === 0).length
  const totalValue = inventory.reduce((sum, i) => sum + i.quantity_on_hand * Number(i.products.unit_price), 0)

  return (
    <>
      <TopBar title="Inventory" searchPlaceholder="Search by product or SKU..." onSearch={setSearchQuery} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Products</p>
              <p className="text-3xl font-bold text-foreground">{inventory.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Inventory Value</p>
              <p className="text-3xl font-bold text-foreground">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-400">{lowCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Out of Stock</p>
              <p className="text-3xl font-bold text-red-400">{outCount}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {['All', 'OK', 'Low', 'Out'].map((status) => (
              <button key={status} type="button" onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                {status === 'Out' ? 'Out of Stock' : status === 'Low' ? 'Low Stock' : status}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'products', label: 'Product', render: (_value, row) => <span className="font-medium text-foreground">{row.products.name}</span> },
                { id: 'products', label: 'SKU', width: 'w-28', render: (_value, row) => <span className="font-mono text-sm text-primary">{row.products.sku}</span> },
                { id: 'quantity_on_hand', label: 'Qty on Hand', width: 'w-28', render: (value, row) => {
                  const color = value === 0 ? 'text-red-400' : value <= row.reorder_level ? 'text-yellow-400' : 'text-green-400'
                  return <span className={`font-semibold ${color}`}>{value}</span>
                }},
                { id: 'reorder_level', label: 'Reorder Level', width: 'w-28', render: (value) => <span className="text-sm text-muted-foreground">{value}</span> },
                { id: 'quantity_on_hand', label: 'Status', width: 'w-28', render: (value, row) => {
                  if (value === 0) return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">Out of Stock</span>
                  if (value <= row.reorder_level) return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Low Stock</span>
                  return <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">In Stock</span>
                }},
                { id: 'last_restocked_at', label: 'Last Restocked', width: 'w-28', render: (value) => value ? <span className="text-sm text-muted-foreground">{new Date(value).toLocaleDateString()}</span> : <span className="text-sm text-muted-foreground">—</span> },
              ]}
              data={filtered}
              onRowClick={(row) => setAdjustItem(row)}
            />
          </div>
        </div>
      </div>

      {adjustItem && <AdjustmentModal item={adjustItem} onClose={() => setAdjustItem(null)} />}
    </>
  )
}

function AdjustmentModal({ item, onClose }: { item: InventoryWithProduct; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [adjustment, setAdjustment] = useState(0)
  const [note, setNote] = useState('')

  function handleSubmit() {
    if (adjustment === 0) return
    setError(null)
    startTransition(async () => {
      const result = await adjustInventoryAction(item.product_id, adjustment, note)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Adjust Stock</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="font-medium text-foreground">{item.products.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className="font-bold text-foreground text-lg">{item.quantity_on_hand}</p>
          </div>
          <div>
            <label htmlFor="adjQty" className="block text-sm font-medium text-foreground mb-1">Adjustment (+ to add, - to remove)</label>
            <Input id="adjQty" type="number" value={adjustment} onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="adjNote" className="block text-sm font-medium text-foreground mb-1">Note</label>
            <Input id="adjNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment" className="bg-secondary border-border" />
          </div>
          <p className="text-sm text-muted-foreground">New stock: <span className="font-bold text-foreground">{Math.max(0, item.quantity_on_hand + adjustment)}</span></p>
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending || adjustment === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? 'Saving...' : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
