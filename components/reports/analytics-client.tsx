'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'

type InvoiceRow = { issued_date?: string; created_at: string; total: number; status: string; balance_due: number }
type ExpenseRow = { date?: string; created_at: string; amount: number; category: string }
type JobRow = { created_at: string; status: string; job_type: string }

interface AnalyticsClientProps {
  revenue2026: number
  expenses2026: number
  netProfit2026: number
  outstanding2026: number
  revenue2025: number
  expenses2025: number
  netProfit2025: number
  outstanding2025: number
  invoices2026: InvoiceRow[]
  invoices2025: InvoiceRow[]
  jobs: JobRow[]
  expenses2026Data: ExpenseRow[]
  expenses2025Data: ExpenseRow[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORY_COLORS: Record<string, string> = {
  parts: '#00BFFF', fuel: '#FF6B00', tools: '#8B5CF6',
  office: '#64748b', utilities: '#06B6D4', other: '#6B7280',
}

const JOB_TYPE_COLORS: Record<string, string> = {
  repair: '#00BFFF', maintenance: '#10B981', installation: '#FF6B00',
  inspection: '#8B5CF6', emergency: '#EF4444',
}

function pct(current: number, prior: number): string {
  if (prior === 0) return current > 0 ? '+100%' : '0%'
  const diff = ((current - prior) / prior) * 100
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
}

function buildMonthly(invoices: InvoiceRow[], expenses: ExpenseRow[]) {
  return MONTHS.map((month, index) => {
    const rev = invoices
      .filter(i => new Date(i.issued_date || i.created_at).getMonth() === index)
      .reduce((s, i) => s + Number(i.total || 0), 0)
    const exp = expenses
      .filter(e => new Date(e.date || e.created_at).getMonth() === index)
      .reduce((s, e) => s + Number(e.amount || 0), 0)
    return { month, revenue: rev, expenses: exp, profit: rev - exp }
  })
}

const tooltipStyle = {
  backgroundColor: '#13172a',
  border: '1px solid #2d3352',
  borderRadius: '8px',
  color: '#fff',
}

export function AnalyticsClient({
  revenue2026, expenses2026, netProfit2026, outstanding2026,
  revenue2025, expenses2025, netProfit2025, outstanding2025,
  invoices2026, invoices2025, jobs, expenses2026Data, expenses2025Data,
}: AnalyticsClientProps) {

  const monthly2026 = buildMonthly(invoices2026, expenses2026Data)
  const monthly2025 = buildMonthly(invoices2025, expenses2025Data)

  // Merged monthly comparison chart
  const monthlyComparison = MONTHS.map((month, i) => ({
    month,
    '2026 Revenue': monthly2026[i].revenue,
    '2025 Revenue': monthly2025[i].revenue,
    '2026 Expenses': monthly2026[i].expenses,
    '2025 Expenses': monthly2025[i].expenses,
  }))

  // Invoice status breakdown per year
  function statusBreakdown(invoices: InvoiceRow[]) {
    const m: Record<string, number> = {}
    invoices.forEach(inv => { m[inv.status] = (m[inv.status] || 0) + Number(inv.total || 0) })
    return [
      { name: 'Paid', value: m['paid'] || 0, color: '#10B981' },
      { name: 'Pending', value: (m['sent'] || 0) + (m['draft'] || 0) + (m['pending'] || 0), color: '#FF6B00' },
      { name: 'Overdue', value: m['overdue'] || 0, color: '#EF4444' },
      { name: 'Partial', value: m['partial'] || 0, color: '#F59E0B' },
    ].filter(d => d.value > 0)
  }

  // Expense categories
  function expenseCategories(expenses: ExpenseRow[]) {
    const m: Record<string, number> = {}
    expenses.forEach(e => { const c = e.category || 'other'; m[c] = (m[c] || 0) + Number(e.amount || 0) })
    return Object.entries(m).map(([cat, amount]) => ({
      cat: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount,
      color: CATEGORY_COLORS[cat] || '#6B7280',
    })).sort((a, b) => b.amount - a.amount)
  }

  // Job type breakdown
  const jobTypeMap: Record<string, number> = {}
  jobs.filter(j => j.status === 'completed').forEach(j => {
    const t = j.job_type || 'other'
    jobTypeMap[t] = (jobTypeMap[t] || 0) + 1
  })
  const jobTypeData = Object.entries(jobTypeMap).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    color: JOB_TYPE_COLORS[type] || '#6B7280',
  })).sort((a, b) => b.count - a.count)

  // Summary comparison rows for the stat cards
  const comparisonStats = [
    {
      label: 'Total Revenue',
      v2026: revenue2026,
      v2025: revenue2025,
      icon: TrendingUp,
      color: '#00BFFF',
    },
    {
      label: 'Total Expenses',
      v2026: expenses2026,
      v2025: expenses2025,
      icon: TrendingDown,
      color: '#FF6B00',
    },
    {
      label: 'Net Profit',
      v2026: netProfit2026,
      v2025: netProfit2025,
      icon: DollarSign,
      color: '#10B981',
    },
    {
      label: 'Outstanding',
      v2026: outstanding2026,
      v2025: outstanding2025,
      icon: AlertCircle,
      color: '#F59E0B',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Year Comparison Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonStats.map((s) => {
          const change = pct(s.v2026, s.v2025)
          const isUp = !change.startsWith('-')
          const isRevenue = s.label === 'Total Revenue' || s.label === 'Net Profit'
          const positive = isRevenue ? isUp : !isUp
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{s.label}</p>
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${s.color}18` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">2026</span>
                    <span className="text-base font-bold text-foreground">
                      JMD {s.v2026.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">2025</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      JMD {s.v2025.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <div className={`text-xs font-semibold ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
                  {change} vs 2025
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
          {[
            { value: 'revenue', label: 'Revenue & P/L' },
            { value: 'invoices', label: 'Invoices' },
            { value: 'jobs', label: 'Jobs' },
            { value: 'expenses', label: 'Expenses' },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black capitalize"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Revenue & P/L Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Monthly comparison line chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                Monthly Revenue — 2026 vs 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyComparison} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                    <Line type="monotone" dataKey="2026 Revenue" stroke="#00BFFF" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="2025 Revenue" stroke="#00BFFF" strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.5} />
                    <Line type="monotone" dataKey="2026 Expenses" stroke="#FF6B00" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="2025 Expenses" stroke="#FF6B00" strokeWidth={1.5} strokeDasharray="4 3" dot={false} opacity={0.5} />
                    <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly bar charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2026 — Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly2026} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                      <Bar dataKey="revenue" fill="#00BFFF" radius={[3, 3, 0, 0]} name="Revenue" />
                      <Bar dataKey="expenses" fill="#FF6B00" radius={[3, 3, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2025 — Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly2025} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                      <Bar dataKey="revenue" fill="#00BFFF" opacity={0.6} radius={[3, 3, 0, 0]} name="Revenue" />
                      <Bar dataKey="expenses" fill="#FF6B00" opacity={0.6} radius={[3, 3, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2026 Invoice Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown(invoices2026)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {statusBreakdown(invoices2026).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                      <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2025 Invoice Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown(invoices2025)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {statusBreakdown(invoices2025).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                      <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Invoice counts comparison */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Invoice Count by Status — 2026 vs 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                {['paid', 'sent', 'pending', 'overdue', 'draft'].map(status => {
                  const count26 = invoices2026.filter(i => i.status === status).length
                  const count25 = invoices2025.filter(i => i.status === status).length
                  const max = Math.max(count26, count25, 1)
                  return (
                    <div key={status} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground capitalize">{status}</span>
                        <div className="flex gap-4">
                          <span className="text-[#00BFFF] font-semibold">2026: {count26}</span>
                          <span className="text-muted-foreground">2025: {count25}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-[#00BFFF] rounded-full" style={{ width: `${(count26 / max) * 100}%` }} />
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-[#00BFFF] opacity-40 rounded-full" style={{ width: `${(count25 / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Revenue by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobTypeData.length === 0 ? (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No completed job data available.</div>
                ) : (
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={jobTypeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                        <XAxis type="number" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <YAxis type="category" dataKey="type" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={80} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Jobs">
                          {jobTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Job Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Total Jobs', value: jobs.length, color: 'text-foreground' },
                    { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: 'text-emerald-500' },
                    { label: 'In Progress', value: jobs.filter(j => j.status === 'in-progress').length, color: 'text-blue-400' },
                    { label: 'Scheduled', value: jobs.filter(j => j.status === 'scheduled').length, color: 'text-[#FF6B00]' },
                    { label: 'Pending', value: jobs.filter(j => j.status === 'pending').length, color: 'text-amber-500' },
                    {
                      label: 'Completion Rate',
                      value: jobs.length > 0 ? `${((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(1)}%` : '0%',
                      color: 'text-[#00BFFF]',
                    },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 2026 Expenses */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2026 Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseCategories(expenses2026Data).length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No 2026 expense data.</div>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories(expenses2026Data).map(item => (
                      <div key={item.cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.cat}</span>
                          <span className="font-medium" style={{ color: item.color }}>JMD {item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(item.amount / Math.max(...expenseCategories(expenses2026Data).map(e => e.amount))) * 100}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2025 Expenses */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  2025 Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseCategories(expenses2025Data).length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No 2025 expense data.</div>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories(expenses2025Data).map(item => (
                      <div key={item.cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.cat}</span>
                          <span className="font-medium opacity-70" style={{ color: item.color }}>JMD {item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full opacity-60" style={{ width: `${(item.amount / Math.max(...expenseCategories(expenses2025Data).map(e => e.amount))) * 100}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense distribution donut */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Expense Distribution — 2026 vs 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-center text-muted-foreground mb-2 font-medium">2026</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseCategories(expenses2026Data).map(e => ({ name: e.cat, value: e.amount, color: e.color }))} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value">
                            {expenseCategories(expenses2026Data).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-center text-muted-foreground mb-2 font-medium">2025</p>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseCategories(expenses2025Data).map(e => ({ name: e.cat, value: e.amount, color: e.color }))} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value">
                            {expenseCategories(expenses2025Data).map((entry, i) => <Cell key={i} fill={`${entry.color}99`} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`JMD ${v.toLocaleString()}`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
