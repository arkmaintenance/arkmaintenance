import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  FileText,
  Wrench,
  Receipt,
  Quote,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditClientDialog } from '@/components/clients/edit-client-dialog'

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0,
  }).format(value)
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm text-foreground">{value || '—'}</div>
    </div>
  )
}

export default async function ClientDetailPage({ params }: { params: any }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params
  const supabase = await createClient()

  // Fetch client details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch related data
  const [
    { data: jobs },
    { data: invoices },
    { data: quotations },
  ] = await Promise.all([
    supabase.from('jobs').select('id, title, status, scheduled_date, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('id, invoice_number, total, status, issued_date, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('quotations').select('id, quotation_number, total, status, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Client Details" />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="border-border">
                <Link href="/admin/clients">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <EditClientDialog 
                client={client as any} 
                trigger={
                  <Button variant="outline" className="border-border">
                    <Wrench className="h-4 w-4" />
                    Edit Client
                  </Button>
                }
              />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-[#00BFFF]/40 bg-[#00BFFF]/10 text-[#00BFFF] uppercase tracking-wider">
                  {client.client_type}
                </Badge>
                <Badge variant="outline" className={client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-500/20 text-slate-400 border-slate-500/40'}>
                  {client.status}
                </Badge>
              </div>

              <h2 className="text-3xl font-bold text-foreground">
                {client.company_name || client.contact_name}
              </h2>
              {client.company_name && (
                <p className="text-lg text-muted-foreground font-medium">{client.contact_name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Email" value={client.email} icon={<Mail className="h-3.5 w-3.5" />} />
          <DetailItem label="Phone" value={client.phone} icon={<Phone className="h-3.5 w-3.5" />} />
          <DetailItem label="Address" value={[client.address, client.city, client.parish].filter(Boolean).join(', ')} icon={<MapPin className="h-3.5 w-3.5" />} />
          <DetailItem label="Created" value={formatDate(client.created_at)} icon={<FileText className="h-3.5 w-3.5" />} />
        </div>

        {client.notes && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Jobs History */}
          <Card className="border-border bg-card xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#FF6B00]" />
                  Recent Jobs
                </CardTitle>
                <CardDescription>Latest service history</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs && jobs.length > 0 ? (
                  jobs.slice(0, 5).map((job) => (
                    <Link 
                      key={job.id} 
                      href={`/admin/jobs/${job.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(job.scheduled_date || job.created_at)}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-[10px] uppercase">
                        {job.status}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No jobs found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="border-border bg-card xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-500" />
                  Invoices
                </CardTitle>
                <CardDescription>Billing and payments</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices && invoices.length > 0 ? (
                  invoices.slice(0, 5).map((inv) => (
                    <Link 
                      key={inv.id} 
                      href={`/admin/invoices/${inv.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(inv.issued_date || inv.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF6B00]">{formatCurrency(inv.total)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{inv.status}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quotations */}
          <Card className="border-border bg-card xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-[#00BFFF]" />
                  Quotations
                </CardTitle>
                <CardDescription>Pending and old estimates</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations && quotations.length > 0 ? (
                  quotations.slice(0, 5).map((q) => (
                    <Link 
                      key={q.id} 
                      href={`/admin/quotations/${q.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{q.quotation_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(q.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(q.total)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{q.status}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No quotations found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
