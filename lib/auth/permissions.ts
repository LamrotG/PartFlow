import type { Profile } from '@/lib/types/database'

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

export function isActive(profile: Profile | null): boolean {
  return profile?.is_active === true
}

const ADMIN_ONLY_ROUTES = ['/employees', '/audit-logs']
const ADMIN_ONLY_ACTIONS = ['manage_employees', 'delete_records', 'manage_settings', 'view_audit_logs'] as const

export function canAccessRoute(profile: Profile | null, pathname: string): boolean {
  if (!profile || !profile.is_active) return false
  if (profile.role === 'admin') return true
  return !ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))
}

export function canPerformAction(
  profile: Profile | null,
  action: (typeof ADMIN_ONLY_ACTIONS)[number]
): boolean {
  if (!profile || !profile.is_active) return false
  if (profile.role === 'admin') return true
  return !ADMIN_ONLY_ACTIONS.includes(action)
}
