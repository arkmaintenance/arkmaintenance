import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Clock, Briefcase, Users, FileText, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalClients: number
    totalJobs: number
    totalRevenue: number
    pendingAmount: number
    technicianCount: number
    invoiceCount: number
    totalExpenses?: number
    overdueInvoices?: number
    overdueBalanceTotal?: number
    activeContracts?: number
    yearlyContractValue?: number
    pendingQuotes?: number
    activeJobs?: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const row1 = [
    {
      title: 'Total Revenue',
      value: `JMD ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/12',
      border: 'border-emerald-500/30',
      bar: 'bg-emerald-500',
    },
    {
      title: 'Total Expenses',
      value: `JMD ${(stats.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: TrendingDown,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/12',
      border: 'border-rose-500/30',
      bar: 'bg-rose-500',
    },
    {
      title: 'Outstanding',
      value: `JMD ${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/12',
      border: 'border-amber-500/30',
      bar: 'bg-amber-500',
    },
    {
      title: 'Active Jobs',
      value: (stats.activeJobs ?? stats.totalJobs).toLocaleString(),
      icon: Briefcase,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/12',
      border: 'border-sky-500/30',
      bar: 'bg-sky-500',
    },
    {
      title: 'Clients',
      value: stats.totalClients.toLocaleString(),
      icon: Users,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/12',
      border: 'border-violet-500/30',
      bar: 'bg-violet-500',
    },
  ]

  const row2 = [
    {
      title: 'Pending Quotes',
      value: (stats.pendingQuotes || 0).toLocaleString(),
      icon: FileText,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/12',
      border: 'border-fuchsia-500/30',
      bar: 'bg-fuchsia-500',
    },
    {
      title: 'Overdue Invoices',
      value: (stats.overdueInvoices || 0).toLocaleString(),
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/12',
      border: 'border-red-500/30',
      bar: 'bg-red-500',
    },
    {
      title: 'Overdue Balance',
      value: `JMD ${(stats.overdueBalanceTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/12',
      border: 'border-orange-500/30',
      bar: 'bg-orange-500',
    },
    {
      title: 'Active Contracts',
      value: (stats.activeContracts || 0).toLocaleString(),
      icon: RefreshCw,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/12',
      border: 'border-teal-500/30',
      bar: 'bg-teal-500',
    },
    {
      title: 'Contract Value',
      value: `JMD ${(stats.yearlyContractValue || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/12',
      border: 'border-lime-500/30',
      bar: 'bg-lime-500',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {row1.map((card) => (
          <Card key={card.title} className={`border ${card.border} overflow-hidden bg-card`}>
            <div className={`h-1 w-full ${card.bar}`} />
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{card.title}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${card.bgColor} shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {row2.map((card) => (
          <Card key={card.title} className={`border ${card.border} overflow-hidden bg-card`}>
            <div className={`h-1 w-full ${card.bar}`} />
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{card.title}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${card.bgColor} shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
