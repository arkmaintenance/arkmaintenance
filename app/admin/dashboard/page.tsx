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

  const YEAR = 2026
  const yearStart = `${YEAR}-01-01`
  const yearEnd   = `${YEAR}-12-31`

  // Fetch all 2026 invoices for stats + charts + recent list
  const { data: yearInvoices } = await supabase
    .from('invoices')
    .select('*, clients(contact_name, company_name)')
    .gte('issued_date', yearStart)
    .lte('issued_date', yearEnd)
    .order('issued_date', { ascending: false })

  // Counts scoped to 2026
  const invoiceCount = yearInvoices?.length || 0
  const totalRevenue = yearInvoices?.reduce((s, i) => s + Number(i.total || 0), 0) || 0
  const pendingAmount = yearInvoices
    ?.filter(i => ['pending', 'sent', 'overdue', 'draft'].includes(i.status))
    .reduce((s, i) => s + Number(i.balance_due || 0), 0) || 0
  const overdueInvoices = yearInvoices?.filter(i => i.status === 'overdue').length || 0
  const overdueBalanceTotal = yearInvoices
    ?.filter(i => i.status === 'overdue')
    .reduce((s, i) => s + Number(i.balance_due || 0), 0) || 0

  // Expenses scoped to 2026
  const { data: yearExpenses } = await supabase
    .from('expenses')
    .select('amount, date, created_at')
    .gte('date', yearStart)
    .lte('date', yearEnd)
  const totalExpenses = yearExpenses?.reduce((s, e) => s + Number(e.amount || 0), 0) || 0

  // Global counts (clients, jobs, technicians are not year-scoped)
  const [
    { count: clientCount },
    { count: jobCount },
    { count: technicianCount },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('technicians').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*, clients(contact_name, company_name), technicians(name)').order('created_at', { ascending: false }).limit(5),
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
    .from('jobs').select('*', { count: 'exact', head: true }).in('status', ['scheduled', 'in-progress'])

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

  // Monthly chart — 2026 invoices by issued_date + 2026 expenses
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = MONTHS.map((month, index) => {
    const rev = (yearInvoices || [])
      .filter(i => new Date(i.issued_date || i.created_at).getMonth() === index)
      .reduce((s, i) => s + Number(i.total || 0), 0)
    const exp = (yearExpenses || [])
      .filter(e => new Date(e.date || e.created_at).getMonth() === index)
      .reduce((s, e) => s + Number(e.amount || 0), 0)
    return { month, revenue: rev, expenses: exp }
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
              {"Here's what's happening with your business today. (2026 figures)"}
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
