import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { AnalyticsClient } from '@/components/reports/analytics-client'

export default async function ReportsPage() {
  const supabase = await createClient()

  const [
    { data: invoices },
    { data: jobs },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('invoices').select('*'),
    supabase.from('jobs').select('*'),
    supabase.from('expenses').select('*'),
  ])

  const getYear = (inv: { issued_date?: string; created_at: string }) =>
    new Date(inv.issued_date || inv.created_at).getFullYear()

  const invoices2026 = invoices?.filter(i => getYear(i) === 2026) || []
  const invoices2025 = invoices?.filter(i => getYear(i) === 2025) || []

  const getExpYear = (e: { date?: string; created_at: string }) =>
    new Date(e.date || e.created_at).getFullYear()

  const expenses2026 = expenses?.filter(e => getExpYear(e) === 2026) || []
  const expenses2025 = expenses?.filter(e => getExpYear(e) === 2025) || []

  // 2026 stats
  const revenue2026 = invoices2026.reduce((s, i) => s + Number(i.total || 0), 0)
  const expenses2026Total = expenses2026.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netProfit2026 = revenue2026 - expenses2026Total
  const outstanding2026 = invoices2026
    .filter(i => ['pending', 'sent', 'overdue', 'draft'].includes(i.status))
    .reduce((s, i) => s + Number(i.balance_due || 0), 0)

  // 2025 stats (for comparison)
  const revenue2025 = invoices2025.reduce((s, i) => s + Number(i.total || 0), 0)
  const expenses2025Total = expenses2025.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netProfit2025 = revenue2025 - expenses2025Total
  const outstanding2025 = invoices2025
    .filter(i => ['pending', 'sent', 'overdue', 'draft'].includes(i.status))
    .reduce((s, i) => s + Number(i.balance_due || 0), 0)

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Analytics" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports &amp; Analytics</h2>
          <p className="text-muted-foreground">Business performance metrics — 2026 vs 2025 comparison.</p>
        </div>
        <AnalyticsClient
          revenue2026={revenue2026}
          expenses2026={expenses2026Total}
          netProfit2026={netProfit2026}
          outstanding2026={outstanding2026}
          revenue2025={revenue2025}
          expenses2025={expenses2025Total}
          netProfit2025={netProfit2025}
          outstanding2025={outstanding2025}
          invoices2026={invoices2026}
          invoices2025={invoices2025}
          jobs={jobs || []}
          expenses2026Data={expenses2026}
          expenses2025Data={expenses2025}
        />
      </div>
    </div>
  )
}
