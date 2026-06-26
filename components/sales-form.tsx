'use client'

import { useState, useTransition } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSaleAction } from '@/app/(dashboard)/sales/actions'
import type { Customer } from '@/lib/types/database'

interface SalesItem {
  product_id: string
  name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface SalesFormProps {
  customers: Customer[]
  products: { id: string; sku: string; name: string; unit_price: number }[]
  onClose: () => void
}

export function SalesForm({ customers, products, onClose }: SalesFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [items, setItems] = useState<SalesItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check' | 'bank_transfer' | 'credit'>('cash')
  const [notes, setNotes] = useState('')

  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0)
  const remainingAmount = totalAmount - paidAmount

  function handleAddItem() {
    if (!selectedProduct || quantity <= 0) return
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingIndex = items.findIndex((i) => i.product_id === product.id)
    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex].quantity += quantity
      updated[existingIndex].line_total = updated[existingIndex].unit_price * updated[existingIndex].quantity
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          name: product.name,
          quantity,
          unit_price: product.unit_price,
          line_total: product.unit_price * quantity,
        },
      ])
    }
    setSelectedProduct('')
    setQuantity(1)
  }

  function handleSubmit() {
    if (items.length === 0) {
      setError('Add at least one item')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createSaleAction({
        customer_id: selectedCustomer || null,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        paid_amount: paidAmount,
        payment_method: paymentMethod,
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">New Sale</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              aria-label="Customer"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm"
            >
              <option value="">Walk-in customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-4">Add Items</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                aria-label="Product"
                className="col-span-2 bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.unit_price.toFixed(2)})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-secondary border-border text-sm"
                min="1"
              />
              <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left text-foreground font-semibold">Part</th>
                    <th className="px-4 py-2 text-right text-foreground font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right text-foreground font-semibold">Price</th>
                    <th className="px-4 py-2 text-right text-foreground font-semibold">Total</th>
                    <th className="px-4 py-2 w-12"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.product_id} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground">{item.name}</td>
                      <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-foreground">${item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">${item.line_total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-600" title="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  aria-label="Payment method"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Paid Amount</label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="bg-secondary border-border text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm min-h-[60px] resize-none"
                placeholder="Optional notes..."
              />
            </div>

            <div className="bg-secondary rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-foreground">Total Amount:</span>
                <span className="font-semibold text-foreground">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-foreground">Paid Amount:</span>
                <span className="font-semibold text-foreground">${paidAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-foreground">Remaining:</span>
                <span className="font-bold text-primary">${remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? 'Creating...' : 'Create Sale'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
