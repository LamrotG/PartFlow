'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  title: string
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  actions?: React.ReactNode
}

export function TopBar({
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  actions,
}: TopBarProps) {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 gap-4">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>

      <div className="flex-1 flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 h-9 bg-secondary border-border text-sm"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
