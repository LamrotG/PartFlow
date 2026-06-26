'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column {
  id: string
  label: string
  width?: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  sortBy?: string
  onSort?: (column: string) => void
  highlightedRow?: string
}

export function DataTable({
  columns,
  data,
  onRowClick,
  sortBy,
  onSort,
  highlightedRow,
}: DataTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="bg-secondary border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-foreground',
                    column.width
                  )}
                  onClick={() => column.sortable && onSort?.(column.id)}
                >
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    {column.label}
                    {sortBy === column.id && column.sortable && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = row.id || idx.toString()
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-t border-border transition-colors cursor-pointer',
                      hoveredRow === rowId && 'bg-secondary/50',
                      highlightedRow === rowId && 'bg-primary/10'
                    )}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowId}-${column.id}`}
                        className={cn('px-4 py-3 text-foreground', column.width)}
                      >
                        {column.render ? column.render(row[column.id], row) : row[column.id]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
