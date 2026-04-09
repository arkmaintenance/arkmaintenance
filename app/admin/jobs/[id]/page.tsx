import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Phone,
  Repeat,
  UserRound,
  Wrench,
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

interface JobDetailRecord {
  id: string
  title: string
  description: string | null
  job_type: string
  status: string
  priority: string
  scheduled_date: string | null
  scheduled_time: string | null
  address: string | null
  notes: unknown
  is_recurring: boolean | null
  created_at: string
  updated_at: string
  clients: {
    contact_name: string | null
    company_name: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    parish: string | null
  } | null
  technicians: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

interface JobLineItem {
  description: string
  quantity: number
  unit_price: number
}

interface ParsedJobNotes {
  appointment?: boolean
  contact_person?: unknown
  location?: unknown
  department?: unknown
  supplier?: unknown
  materials?: unknown
  tech_charge?: unknown
  line_items?: unknown
  recurring_schedule?: unknown
  is_service_contract?: unknown
  telephone?: unknown
  address_landmark?: unknown
  additional_technicians?: unknown
  company_name?: unknown
  free_text?: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  scheduled: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40',
  'in-progress': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  completed: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/40',
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function parseNotes(notes: unknown): ParsedJobNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedJobNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedJobNotes
  } catch {
    return { free_text: notes }
  }
}

function normalizeLineItems(value: unknown): JobLineItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      const record = item as Record<string, unknown>
      const quantity = Number(record.quantity ?? record.qty ?? 0)
      const unitPrice = Number(record.unit_price ?? record.unitPrice ?? 0)

      return {
        description: asText(record.description),
        quantity: Number.isFinite(quantity) ? quantity : 0,
        unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
      }
    })
    .filter((item) => item.description || item.quantity || item.unit_price)
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled'

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(value: string | null) {
  if (!value) return 'Time TBD'

  const [hours = '0', minutes = '0'] = value.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm text-foreground">{value || 'Not provided'}</div>
    </div>
  )
}

export default async function JobDetailPage({ params }: { params: any }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      job_type,
      status,
      priority,
      scheduled_date,
      scheduled_time,
      address,
      notes,
      is_recurring,
      created_at,
      updated_at,
      clients (
        contact_name,
        company_name,
        email,
        phone,
        address,
        city,
        parish
      ),
      technicians (
        name,
        email,
        phone
      )
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !job) {
    notFound()
  }

  const record = job as JobDetailRecord
  const parsedNotes = parseNotes(record.notes)
  const lineItems = normalizeLineItems(parsedNotes.line_items)
  const isAppointment = record.job_type === 'appointment' || parsedNotes.appointment === true
  const recurringSchedule = asText(parsedNotes.recurring_schedule)
  const additionalTechnicians = Array.isArray(parsedNotes.additional_technicians)
    ? parsedNotes.additional_technicians.map((name) => asText(name)).filter(Boolean).join(', ')
    : ''
  const clientName =
    record.clients?.company_name ||
    record.clients?.contact_name ||
    asText(parsedNotes.company_name) ||
    'Walk-in / Unassigned'
  const contactPerson = asText(parsedNotes.contact_person) || record.clients?.contact_name || ''
  const clientAddress =
    record.address ||
    [record.clients?.address, record.clients?.city, record.clients?.parish].filter(Boolean).join(', ')
  const backHref = isAppointment ? '/admin/calendar' : '/admin/jobs'
  const pageTitle = isAppointment ? 'Appointment Details' : 'Job Details'

  return (
    <div className="flex flex-col">
      <DashboardHeader title={pageTitle} />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="outline" className="border-border">
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusColors[record.status] || statusColors.pending}>
                  {formatLabel(record.status)}
                </Badge>
                <Badge variant="outline" className={priorityColors[record.priority] || priorityColors.medium}>
                  {formatLabel(record.priority)}
                </Badge>
                <Badge variant="outline" className="border-[#00BFFF]/40 bg-[#00BFFF]/10 text-[#00BFFF]">
                  {isAppointment ? 'Appointment' : formatLabel(record.job_type)}
                </Badge>
                {parsedNotes.is_service_contract === true ? (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                    Service Contract
                  </Badge>
                ) : null}
              </div>

              <h2 className="text-3xl font-bold text-foreground">{record.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Created {formatDateTime(record.created_at)}. Last updated {formatDateTime(record.updated_at)}.
              </p>
            </div>
          </div>

          <Card className="w-full border-border bg-card lg:max-w-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule</CardTitle>
              <CardDescription>
                {record.scheduled_date ? 'Scheduled work window' : 'No schedule assigned yet'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DetailItem label="Date" value={formatDate(record.scheduled_date)} icon={<CalendarDays className="h-3.5 w-3.5" />} />
              <DetailItem label="Time" value={formatTime(record.scheduled_time)} icon={<Clock3 className="h-3.5 w-3.5" />} />
              <DetailItem
                label="Recurring"
                value={record.is_recurring ? formatLabel(recurringSchedule || 'Recurring') : 'One-time'}
                icon={<Repeat className="h-3.5 w-3.5" />}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Client</CardTitle>
              <CardDescription>Primary client and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Company / Client" value={clientName} icon={<Building2 className="h-3.5 w-3.5" />} />
              <DetailItem label="Contact Person" value={contactPerson} icon={<UserRound className="h-3.5 w-3.5" />} />
              <DetailItem label="Telephone" value={asText(parsedNotes.telephone) || record.clients?.phone || ''} icon={<Phone className="h-3.5 w-3.5" />} />
              <DetailItem label="Address" value={clientAddress} icon={<MapPin className="h-3.5 w-3.5" />} />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{isAppointment ? 'Appointment Info' : 'Work Info'}</CardTitle>
              <CardDescription>
                {isAppointment ? 'Assigned team and visit details.' : 'Operational details for this job.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <DetailItem label="Technician" value={record.technicians?.name || ''} icon={<Wrench className="h-3.5 w-3.5" />} />
              <DetailItem
                label={isAppointment ? 'Additional Technicians' : 'Department'}
                value={isAppointment ? additionalTechnicians : asText(parsedNotes.department)}
                icon={<Wrench className="h-3.5 w-3.5" />}
              />
              <DetailItem
                label={isAppointment ? 'Landmark' : 'Location'}
                value={isAppointment ? asText(parsedNotes.address_landmark) : asText(parsedNotes.location)}
                icon={<MapPin className="h-3.5 w-3.5" />}
              />
              <DetailItem
                label={isAppointment ? 'Notes Source' : 'Tech Charge'}
                value={isAppointment ? 'Appointment record' : asText(parsedNotes.tech_charge) || '0'}
                icon={<FileText className="h-3.5 w-3.5" />}
              />
              {!isAppointment ? (
                <>
                  <DetailItem label="Supplier" value={asText(parsedNotes.supplier)} icon={<Building2 className="h-3.5 w-3.5" />} />
                  <DetailItem label="Materials" value={asText(parsedNotes.materials)} icon={<FileText className="h-3.5 w-3.5" />} />
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {record.description || parsedNotes.free_text ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{isAppointment ? 'Notes' : 'Description'}</CardTitle>
              <CardDescription>
                {isAppointment ? 'Appointment notes entered at creation time.' : 'Job description and additional notes.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-secondary/20 p-4 text-sm text-foreground">
                {record.description || parsedNotes.free_text}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {lineItems.length > 0 ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Items captured in the job payload.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={`${item.description}-${index}`} className="border-border">
                        <TableCell className="text-foreground">{item.description || 'Line item'}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium text-[#FF6B00]">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
