'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FolderOpen,
  Home,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Users2,
  Warehouse,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/login/actions'
import type { Profile } from '@/lib/types/database'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

interface NavGroup {
  label: string
  icon: React.ElementType
  collapsible: boolean
  items: NavItem[]
  adminOnly?: boolean
}

const navConfig: (NavItem | NavGroup)[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  {
    label: 'Sales',
    icon: DollarSign,
    collapsible: true,
    items: [
      { label: 'Sales', href: '/sales', icon: DollarSign },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList },
    ],
  },
  {
    label: 'Catalog',
    icon: Package,
    collapsible: true,
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Inventory', href: '/inventory', icon: Warehouse },
    ],
  },
  {
    label: 'People',
    icon: Users,
    collapsible: true,
    items: [
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Suppliers', href: '/suppliers', icon: Truck },
      { label: 'Employees', href: '/employees', icon: Users2, adminOnly: true },
    ],
  },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck, adminOnly: true },
]

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item
}

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const item of navConfig) {
      if (isGroup(item)) {
        const hasActive = item.items.some((sub) =>
          sub.href === '/' ? pathname === '/' : pathname.startsWith(sub.href)
        )
        initial[item.label] = hasActive
      }
    }
    return initial
  })
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const isAdmin = profile?.role === 'admin'

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center border-b border-sidebar-border', collapsed ? 'justify-center p-3' : 'justify-between p-4')}>
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground text-sm truncate">PartFlow</span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-2' : 'px-3')}>
        <div className="space-y-0.5">
          {navConfig.map((item) => {
            if ('adminOnly' in item && item.adminOnly && !isAdmin) return null

            if (isGroup(item)) {
              const visibleItems = item.items.filter((sub) => !sub.adminOnly || isAdmin)
              if (visibleItems.length === 0) return null
              const isOpen = openGroups[item.label]
              const groupHasActive = visibleItems.some((sub) => isActive(sub.href))
              const GroupIcon = item.icon

              if (collapsed) {
                // In collapsed mode, show just the group icon — click navigates to first item
                return (
                  <Link
                    key={item.label}
                    href={visibleItems[0].href}
                    title={item.label}
                    className={cn(
                      'flex items-center justify-center h-9 w-full rounded-md transition-colors',
                      groupHasActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <GroupIcon className="w-4 h-4" />
                  </Link>
                )
              }

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      groupHasActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <GroupIcon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="ml-4 pl-3 border-l border-sidebar-border space-y-0.5 mt-0.5">
                      {visibleItems.map((sub) => {
                        const SubIcon = sub.icon
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                              isActive(sub.href)
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <SubIcon className="w-3.5 h-3.5" />
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Top-level items (Dashboard, Reports, Settings, Audit Logs)
            const Icon = item.icon
            if (collapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'flex items-center justify-center h-9 w-full rounded-md transition-colors',
                    isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Account Footer */}
      <div className="border-t border-sidebar-border p-2 relative">
        <button
          type="button"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          onMouseEnter={() => setShowAccountMenu(true)}
          className={cn(
            'flex items-center w-full rounded-md transition-colors hover:bg-muted/40',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'employee'}</p>
            </div>
          )}
        </button>

        {/* Sign out popup */}
        {showAccountMenu && (
          <div
            className={cn(
              'absolute bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden',
              collapsed ? 'left-1 right-1' : 'left-2 right-2'
            )}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            {collapsed && (
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => startTransition(() => logout())}
              disabled={isPending}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {isPending ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
