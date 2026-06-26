'use client'

import { useState } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { SalesForm } from '@/components/sales-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { OrderWithDetails, Customer } from '@/lib/types/database'

interface SalesPageContentProps {
  sales: OrderWithDetails[]
  customers: Customer[]
  products: { id: string; sku: string; name: string; unit_price: number }[]
}

export function SalesPageContent({ sales, customers, products }: SalesPageContentProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('date')

  let filteredSales = sales.filter((sale) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      sale.order_number.toLowerCase().includes(q) ||
      sale.customers?.name.toLowerCase().includes(q) ||
      sale.profiles?.full_name.toLowerCase().includes(q)

    const matchesStatus =
      filterStatus === 'All' || sale.payment_status === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  if (sortBy === 'date') {
    filteredSales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy === 'total_amount') {
    filteredSales.sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
  }

  return (
    <>
      <TopBar
        title="Sales Transactions"
        searchPlaceholder="Search by sale ID, customer, or employee..."
        onSearch={setSearchQuery}
        actions={
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Sale
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="flex gap-2">
            {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                {
                  id: 'order_number',
                  label: 'Sale ID',
                  width: 'w-28',
                  sortable: true,
                  render: (value) => <span className="font-mono text-sm text-primary">{value}</span>,
                },
                {
                  id: 'created_at',
                  label: 'Date',
                  width: 'w-32',
                  sortable: true,
                  render: (value) => {
                    const date = new Date(value)
                    return (
                      <div>
                        <div className="text-foreground">{date.toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  },
                },
                {
                  id: 'customers',
                  label: 'Customer',
                  render: (value) => (
                    <span className="font-medium text-foreground">{value?.name || 'Walk-in'}</span>
                  ),
                },
                {
                  id: 'profiles',
                  label: 'Employee',
                  render: (value) => (
                    <span className="text-foreground">{value?.full_name || '—'}</span>
                  ),
                },
                {
                  id: 'total_amount',
                  label: 'Total',
                  width: 'w-24',
                  sortable: true,
                  render: (value) => (
                    <span className="font-semibold text-foreground">
                      ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  id: 'paid_amount',
                  label: 'Paid',
                  width: 'w-24',
                  render: (value) => (
                    <span className="text-green-400">
                      ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  id: 'remaining_amount',
                  label: 'Remaining',
                  width: 'w-28',
                  render: (value) => (
                    <span className="text-yellow-400">
                      ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  id: 'payment_status',
                  label: 'Status',
                  width: 'w-24',
                  render: (value) => {
                    const colors: Record<string, string> = {
                      paid: 'bg-green-500/20 text-green-400',
                      partial: 'bg-yellow-500/20 text-yellow-400',
                      unpaid: 'bg-red-500/20 text-red-400',
                    }
                    return (
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[value] || ''}`}>
                        {value}
                      </span>
                    )
                  },
                },
                {
                  id: 'payment_method',
                  label: 'Method',
                  width: 'w-28',
                  render: (value) => (
                    <span className="text-sm text-muted-foreground capitalize">
                      {(value as string).replace('_', ' ')}
                    </span>
                  ),
                },
              ]}
              data={filteredSales}
              sortBy={sortBy}
              onSort={(column) => setSortBy(column === sortBy ? 'date' : column)}
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">{filteredSales.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ${filteredSales.reduce((sum, s) => sum + Number(s.total_amount), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-400">
                  ${filteredSales.reduce((sum, s) => sum + Number(s.paid_amount), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ${filteredSales.reduce((sum, s) => sum + Number(s.remaining_amount), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <SalesForm
          customers={customers}
          products={products}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}
