import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentJobs } from '@/components/dashboard/recent-jobs'
import { InvoiceStatus } from '@/components/dashboard/invoice-status'
import { UpcomingJobs } from '@/components/dashboard/upcoming-jobs'
import { RecentInvoices } from '@/components/dashboard/recent-invoices'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Dashboard shows 2026 ONLY — 2025 is in the Analytics tab for comparison
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('*, clients(contact_name, company_name)')
    .gte('issued_date', '2026-01-01')
    .lt('issued_date', '2027-01-01')
    .order('issued_date', { ascending: false })

  // Chart uses the same 2026 invoices (Jan–Dec 2026)
  const chartInvoices = allInvoices

  // 2026-only stats
  const yearInvoices = allInvoices
  const invoiceCount = allInvoices?.length || 0
  const totalRevenue = allInvoices?.reduce((s, i) => s + Number(i.total || 0), 0) || 0
  const pendingAmount = allInvoices
    ?.filter(i => ['pending', 'sent', 'overdue', 'draft'].includes(i.status))
    .reduce((s, i) => s + Number(i.balance_due || 0), 0) || 0
  const overdueInvoices = allInvoices?.filter(i => i.status === 'overdue').length || 0
  const overdueBalanceTotal = allInvoices
    ?.filter(i => i.status === 'overdue')
    .reduce((s, i) => s + Number(i.balance_due || 0), 0) || 0

  // 2026-only expenses
  const { data: yearExpenses } = await supabase
    .from('expenses')
    .select('amount, date, created_at')
    .gte('date', '2026-01-01')
    .lt('date', '2027-01-01')
  const totalExpenses = yearExpenses?.reduce((s, e) => s + Number(e.amount || 0), 0) || 0

  // Global counts (clients, jobs, technicians are not year-scoped)
  const [
    { count: clientCount },
    { count: jobCount },
    { count: technicianCount },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).neq('job_type', 'appointment'),
    supabase.from('technicians').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*, clients(contact_name, company_name), technicians(name)').neq('job_type', 'appointment').order('created_at', { ascending: false }).limit(5),
  ])

  // Service contracts
  const { count: activeContracts } = await supabase
    .from('service_contracts').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { data: contractsData } = await supabase
    .from('service_contracts').select('amount').eq('status', 'active')
  const yearlyContractValue = contractsData?.reduce((s, c) => s + Number(c.amount || 0), 0) || 0

  // Pending quotes & active jobs
  const { count: pendingQuotes } = await supabase
    .from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: activeJobs } = await supabase
    .from('jobs').select('*', { count: 'exact', head: true }).neq('job_type', 'appointment').in('status', ['scheduled', 'in-progress'])

  const stats = {
    totalClients: clientCount || 0,
    totalJobs: jobCount || 0,
    totalRevenue,
    pendingAmount,
    technicianCount: technicianCount || 0,
    invoiceCount,
    totalExpenses,
    overdueInvoices,
    overdueBalanceTotal,
    activeContracts: activeContracts || 0,
    yearlyContractValue,
    pendingQuotes: pendingQuotes || 0,
    activeJobs: activeJobs || 0,
  }

  // Jan–Dec 2026 chart
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = Array.from({ length: 12 }, (_, m) => {
    const rev = (chartInvoices || [])
      .filter(inv => {
        const dt = new Date(inv.issued_date || inv.created_at)
        return dt.getFullYear() === 2026 && dt.getMonth() === m
      })
      .reduce((s, inv) => s + Number(inv.total || 0), 0)
    const exp = (yearExpenses || [])
      .filter(e => {
        const dt = new Date(e.date || e.created_at)
        return dt.getFullYear() === 2026 && dt.getMonth() === m
      })
      .reduce((s, e) => s + Number(e.amount || 0), 0)
    return { month: MONTH_NAMES[m], revenue: rev, expenses: exp }
  })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.user_metadata?.first_name || 'Admin'}!
            </h2>
            <p className="text-muted-foreground">
              {"2026 figures. Visit Analytics for 2025 vs 2026 comparison."}
            </p>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={monthlyData} />
          <InvoiceStatus invoices={yearInvoices || []} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentJobs jobs={recentJobs || []} />
          <UpcomingJobs />
        </div>

        <RecentInvoices invoices={(yearInvoices || []).slice(0, 10)} />
      </div>
    </div>
  )
}
