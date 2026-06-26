import { createClient } from '@/lib/supabase/server'
import {
  getEmployeePerformance,
  getTopCustomers,
  getWeeklySalesTrend,
  getPaymentMethodBreakdown,
} from '@/lib/queries/reports'
import { getPaymentStatusBreakdown } from '@/lib/queries/dashboard'
import { ReportsPageContent } from '@/components/reports-page-content'

export default async function ReportsPage() {
  const supabase = await createClient()

  const [employeePerformance, topCustomers, weeklyData, paymentMethods, paymentDistribution] =
    await Promise.all([
      getEmployeePerformance(supabase),
      getTopCustomers(supabase),
      getWeeklySalesTrend(supabase),
      getPaymentMethodBreakdown(supabase),
      getPaymentStatusBreakdown(supabase),
    ])

  const { data: orders } = await supabase.from('orders').select('total_amount, remaining_amount')
  const totalSales = orders?.length || 0
  const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount), 0)
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0
  const outstandingBalance = (orders || []).reduce((sum, o) => sum + Number(o.remaining_amount), 0)

  return (
    <ReportsPageContent
      stats={{ totalSales, totalRevenue, avgSaleValue, outstandingBalance }}
      employeePerformance={employeePerformance}
      topCustomers={topCustomers}
      weeklyData={weeklyData}
      paymentMethods={paymentMethods}
      paymentDistribution={paymentDistribution}
    />
  )
}
