'use client'

import { useState } from 'react'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'

interface AuditLogEntry {
  id: string
  action: string
  table_name: string
  record_id: string
  old_data: unknown
  new_data: unknown
  created_at: string
  profiles: { full_name: string; email: string } | null
}

export function AuditLogsPageContent({ logs }: { logs: AuditLogEntry[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState('All')

  const filtered = logs.filter((log) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      log.table_name.toLowerCase().includes(q) ||
      log.profiles?.full_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q)
    const matchesAction = filterAction === 'All' || log.action === filterAction.toLowerCase()
    return matchesSearch && matchesAction
  })

  return (
    <>
      <TopBar title="Audit Logs" searchPlaceholder="Search by table, user, or action..." onSearch={setSearchQuery} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-7xl">
          <div className="flex gap-2">
            {['All', 'Create', 'Update', 'Delete'].map((action) => (
              <button key={action} type="button" onClick={() => setFilterAction(action)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterAction === action ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                {action}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <DataTable
              columns={[
                { id: 'created_at', label: 'Timestamp', width: 'w-40', render: (value) => <span className="text-sm text-foreground">{new Date(value).toLocaleString()}</span> },
                { id: 'profiles', label: 'User', render: (value) => <span className="text-sm text-foreground">{(value as { full_name: string } | null)?.full_name || 'System'}</span> },
                { id: 'action', label: 'Action', width: 'w-24', render: (value) => {
                  const colors: Record<string, string> = { create: 'bg-green-500/20 text-green-400', update: 'bg-blue-500/20 text-blue-400', delete: 'bg-red-500/20 text-red-400' }
                  return <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[value] || ''}`}>{value}</span>
                }},
                { id: 'table_name', label: 'Table', width: 'w-28', render: (value) => <span className="font-mono text-sm text-primary">{value}</span> },
                { id: 'record_id', label: 'Record ID', width: 'w-32', render: (value) => <span className="font-mono text-xs text-muted-foreground">{String(value).slice(0, 8)}...</span> },
              ]}
              data={filtered}
            />
          </div>
        </div>
      </div>
    </>
  )
}
