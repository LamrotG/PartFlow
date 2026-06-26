'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, TrendingUp, AlertCircle, Package, Users, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/topbar'
import { KPICard } from '@/components/kpi-card'
import { DataTable } from '@/components/data-table'
import Link from 'next/link'

const PAYMENT_STATUS_COLORS = {
  Paid: '#5EC4A0',
  Partial: '#D4A54A',
  Unpaid: '#D96B6B',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#131318',
  border: '1px solid #1E1E24',
  borderRadius: '8px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
}

interface DashboardContentProps {
  stats: {
    todayRevenue: number
    todayTransactions: number
    monthlyRevenue: number
    outstandingBalance: number
    totalProducts: number
    totalCustomers: number
    lowStockItems: number
  }
  revenueTrend: Array<{ date: string; revenue: number }>
  paymentBreakdown: { Paid: number; Partial: number; Unpaid: number }
  recentSales: Array<{
    id: string
    order_number: string
    created_at: string
    total_amount: number
    payment_status: string
    customers: { name: string } | null
    profiles: { full_name: string } | null
  }>
}

export function DashboardContent({
  stats,
  revenueTrend,
  paymentBreakdown,
  recentSales: initialSales,
}: DashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const recentSales = initialSales.filter((sale) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      sale.order_number.toLowerCase().includes(q) ||
      sale.customers?.name.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <TopBar
        title="Dashboard"
        searchPlaceholder="Search sales..."
        onSearch={setSearchQuery}
        actions={
          <Link
            href="/sales"
            className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            New Sale
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Today's Revenue" value={`$${stats.todayRevenue.toLocaleString()}`} icon={DollarSign} color="primary" />
            <KPICard label="Today's Transactions" value={stats.todayTransactions} icon={TrendingUp} color="accent" />
            <KPICard label="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="primary" />
            <KPICard label="Outstanding Balance" value={`$${stats.outstandingBalance.toLocaleString()}`} icon={AlertCircle} color="secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard label="Total Products" value={stats.totalProducts} icon={Package} color="primary" />
            <KPICard label="Total Customers" value={stats.totalCustomers} icon={Users} color="accent" />
            <KPICard label="Low Stock Items" value={stats.lowStockItems} icon={AlertTriangle} color="secondary" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Trend (30 Days)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 36, 0.8)" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525B" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#52525B" style={{ fontSize: '11px' }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ stroke: 'rgba(110, 86, 207, 0.2)' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-revenue)"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ fill: 'var(--chart-revenue)', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: paymentBreakdown.Paid },
                      { name: 'Partial', value: paymentBreakdown.Partial },
                      { name: 'Unpaid', value: paymentBreakdown.Unpaid },
                    ]}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={false}
                  >
                    <Cell fill={PAYMENT_STATUS_COLORS.Paid} />
                    <Cell fill={PAYMENT_STATUS_COLORS.Partial} />
                    <Cell fill={PAYMENT_STATUS_COLORS.Unpaid} />
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [Number(value), 'Transactions']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                {(['Paid', 'Partial', 'Unpaid'] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_STATUS_COLORS[status] }} />
                    <span className="text-muted-foreground">{status}: {paymentBreakdown[status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Recent Sales</h2>
              <span className="text-sm text-muted-foreground">{recentSales.length} shown</span>
            </div>
            <DataTable
              columns={[
                {
                  id: 'order_number',
                  label: 'Sale ID',
                  width: 'w-28',
                  render: (value) => <span className="font-mono text-sm text-primary">{value}</span>,
                },
                {
                  id: 'created_at',
                  label: 'Date',
                  width: 'w-28',
                  render: (value) => new Date(value).toLocaleDateString(),
                },
                {
                  id: 'customers',
                  label: 'Customer',
                  render: (value) => <span className="text-foreground">{value?.name || 'Walk-in'}</span>,
                },
                {
                  id: 'profiles',
                  label: 'Employee',
                  render: (value) => <span className="text-muted-foreground text-sm">{value?.full_name || '—'}</span>,
                },
                {
                  id: 'total_amount',
                  label: 'Total',
                  width: 'w-24',
                  render: (value) => <span className="font-semibold">${Number(value).toLocaleString()}</span>,
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
              ]}
              data={recentSales}
            />
          </div>
        </div>
      </div>
    </>
  )
}
