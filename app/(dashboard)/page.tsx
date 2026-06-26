import { createClient } from '@/lib/supabase/server'
import {
  getDashboardStats,
  getRevenueTrend,
  getPaymentStatusBreakdown,
  getRecentSales,
} from '@/lib/queries/dashboard'
import { DashboardContent } from '@/components/dashboard-content'

export default async function Dashboard() {
  const supabase = await createClient()

  const [stats, revenueTrend, paymentBreakdown, recentSales] = await Promise.all([
    getDashboardStats(supabase),
    getRevenueTrend(supabase),
    getPaymentStatusBreakdown(supabase),
    getRecentSales(supabase),
  ])

  return (
    <DashboardContent
      stats={stats}
      revenueTrend={revenueTrend}
      paymentBreakdown={paymentBreakdown}
      recentSales={recentSales}
    />
  )
}
