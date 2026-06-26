'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TopBar } from '@/components/topbar'

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

interface ReportsPageContentProps {
  stats: { totalSales: number; totalRevenue: number; avgSaleValue: number; outstandingBalance: number }
  employeePerformance: { name: string; sales: number; count: number }[]
  topCustomers: { name: string; spent: number; count: number }[]
  weeklyData: { week: string; amount: number }[]
  paymentMethods: { name: string; amount: number }[]
  paymentDistribution: { Paid: number; Partial: number; Unpaid: number }
}

export function ReportsPageContent({
  stats, employeePerformance, topCustomers, weeklyData, paymentMethods, paymentDistribution,
}: ReportsPageContentProps) {
  return (
    <>
      <TopBar title="Reports & Analytics" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalSales}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Average Sale Value</p>
              <p className="text-3xl font-bold text-foreground">${stats.avgSaleValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Outstanding Balance</p>
              <p className="text-3xl font-bold text-yellow-400">${stats.outstandingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Top Performers (by Sales)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={employeePerformance} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 36, 0.8)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525B" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
                  <YAxis stroke="#52525B" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                  <Bar dataKey="sales" fill="var(--chart-revenue)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Top Customers (by Spending)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topCustomers} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 36, 0.8)" vertical />
                  <XAxis type="number" stroke="#52525B" style={{ fontSize: '11px' }} />
                  <YAxis dataKey="name" type="category" stroke="#52525B" width={140} style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spent']} />
                  <Bar dataKey="spent" fill="var(--chart-neutral-1)" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 36, 0.8)" vertical={false} />
                  <XAxis dataKey="week" stroke="#52525B" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#52525B" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(110, 86, 207, 0.2)' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']} />
                  <Line type="monotone" dataKey="amount" stroke="var(--chart-revenue)" strokeWidth={2.5} isAnimationActive={false} dot={false} activeDot={{ fill: 'var(--chart-revenue)', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground mb-4">Payment Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={[{ name: 'Paid', value: paymentDistribution.Paid }, { name: 'Partial', value: paymentDistribution.Partial }, { name: 'Unpaid', value: paymentDistribution.Unpaid }]} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={false}>
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
                    <span className="text-muted-foreground">{status}: {paymentDistribution[status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Sales by Payment Method</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentMethods} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 36, 0.8)" vertical={false} />
                <XAxis dataKey="name" stroke="#52525B" style={{ fontSize: '11px' }} />
                <YAxis stroke="#52525B" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="var(--chart-neutral-2)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}
