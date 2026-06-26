'use client'

import { useState, useTransition } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { createEmployeeAction, toggleEmployeeActiveAction } from '@/app/(dashboard)/employees/actions'
import { useSession } from '@/components/session-provider'
import type { Profile } from '@/lib/types/database'

type EmployeeWithMetrics = Profile & {
  totalSalesAmount: number
  transactionCount: number
  avgTransactionValue: number
}

export function EmployeesPageContent({ employees }: { employees: EmployeeWithMetrics[] }) {
  const { profile: currentUser } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [isPendingToggle, startToggleTransition] = useTransition()
  const [sortBy, setSortBy] = useState('full_name')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const departments = ['All', ...new Set(employees.map((e) => e.department).filter(Boolean) as string[])]

  let filtered = employees.filter((e) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    const matchesDept = filterDept === 'All' || e.department === filterDept
    return matchesSearch && matchesDept
  })

  if (sortBy === 'full_name') filtered.sort((a, b) => a.full_name.localeCompare(b.full_name))
  else if (sortBy === 'totalSalesAmount') filtered.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount)

  return (
    <>
      <TopBar
        title="Employees"
        searchPlaceholder="Search by name or email..."
        onSearch={setSearchQuery}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="flex gap-2 flex-wrap">
            {departments.map((dept) => (
              <button key={dept} type="button" onClick={() => setFilterDept(dept)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterDept === dept ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Employees</p>
              <p className="text-3xl font-bold text-foreground">{employees.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-foreground">{employees.reduce((sum, e) => sum + e.transactionCount, 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Total Sales Amount</p>
              <p className="text-3xl font-bold text-foreground">
                ${employees.reduce((sum, e) => sum + e.totalSalesAmount, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'full_name', label: 'Name', sortable: true, render: (value) => <span className="font-medium text-foreground">{value}</span> },
                { id: 'email', label: 'Email', render: (value) => <span className="text-sm text-muted-foreground">{value}</span> },
                { id: 'role', label: 'Role', width: 'w-24', render: (value) => <span className="px-2 py-1 bg-secondary/50 rounded text-sm font-medium text-foreground capitalize">{value}</span> },
                { id: 'department', label: 'Department', width: 'w-28', render: (value) => <span className="text-sm text-foreground">{value || '—'}</span> },
                { id: 'is_active', label: 'Status', width: 'w-24', render: (value, row) => (
                  <button
                    type="button"
                    disabled={isPendingToggle || row.id === currentUser?.id}
                    onClick={(e) => { e.stopPropagation(); startToggleTransition(async () => { await toggleEmployeeActiveAction(row.id) }) }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-opacity ${value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} ${row.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                    title={row.id === currentUser?.id ? 'Cannot deactivate yourself' : value ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {value ? 'Active' : 'Inactive'}
                  </button>
                )},
                { id: 'transactionCount', label: 'Sales', width: 'w-20', sortable: true, render: (value) => <span className="text-sm font-semibold text-foreground">{value}</span> },
                { id: 'totalSalesAmount', label: 'Revenue', width: 'w-28', sortable: true, render: (value) => <span className="font-semibold text-foreground">${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> },
                { id: 'avgTransactionValue', label: 'Avg Sale', width: 'w-28', render: (value) => <span className="text-sm text-muted-foreground">${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> },
              ]}
              data={filtered}
              sortBy={sortBy}
              onSort={(col) => setSortBy(col === sortBy ? 'full_name' : col)}
            />
          </div>
        </div>
      </div>

      {showForm && <EmployeeFormModal onClose={() => setShowForm(false)} />}
    </>
  )
}

function EmployeeFormModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createEmployeeAction(formData)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Employee</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-xs text-muted-foreground">
            The employee will use this email and password to sign in. They can update their profile after logging in.
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <Input id="fullName" name="fullName" required className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="empEmail" className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <Input id="empEmail" name="email" type="email" required className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="empPassword" className="block text-sm font-medium text-foreground mb-1">Password *</label>
            <Input id="empPassword" name="password" type="password" required minLength={6} placeholder="Min. 6 characters" className="bg-secondary border-border" />
          </div>
          <div>
            <label htmlFor="empRole" className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select id="empRole" name="role" aria-label="Role" className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground text-sm">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">Department</label>
            <Input id="department" name="department" className="bg-secondary border-border" />
          </div>
          {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
