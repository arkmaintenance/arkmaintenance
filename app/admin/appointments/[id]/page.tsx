import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  UserRound,
  Wrench,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AppointmentRecord {
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

interface ParsedAppointmentNotes {
  appointment?: boolean
  contact_person?: unknown
  telephone?: unknown
  address_landmark?: unknown
  additional_technicians?: unknown
  company_name?: unknown
  recurring_schedule?: unknown
  free_text?: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  scheduled: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'in-progress': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
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

function parseNotes(notes: unknown): ParsedAppointmentNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedAppointmentNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedAppointmentNotes
  } catch {
    return { free_text: notes }
  }
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

export default async function AppointmentDetailPage({ params }: { params: any }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params
  const supabase = await createClient()

  const { data, error } = await supabase
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

  if (error || !data) {
    notFound()
  }

  const record = data as AppointmentRecord
  const parsedNotes = parseNotes(record.notes)
  const isAppointment = record.job_type === 'appointment' || parsedNotes.appointment === true

  if (!isAppointment) {
    redirect(`/admin/jobs/${record.id}`)
  }

  const clientName =
    record.clients?.company_name ||
    record.clients?.contact_name ||
    asText(parsedNotes.company_name) ||
    'Walk-in / Unassigned'
  const contactPerson = asText(parsedNotes.contact_person) || record.clients?.contact_name || ''
  const telephone = asText(parsedNotes.telephone) || record.clients?.phone || ''
  const address =
    record.address ||
    [record.clients?.address, record.clients?.city, record.clients?.parish].filter(Boolean).join(', ')
  const additionalTechnicians = Array.isArray(parsedNotes.additional_technicians)
    ? parsedNotes.additional_technicians.map((entry) => asText(entry)).filter(Boolean).join(', ')
    : ''
  const noteText = record.description || parsedNotes.free_text || ''

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Appointment Details" />

      <div className="space-y-6 p-6">
        <div className="space-y-3">
          <Button asChild variant="outline" className="border-border">
            <Link href="/admin/appointments">
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusColors[record.status] || statusColors.scheduled}>
              {formatLabel(record.status)}
            </Badge>
            <Badge variant="outline" className={priorityColors[record.priority] || priorityColors.medium}>
              {formatLabel(record.priority)}
            </Badge>
            <Badge variant="outline" className="border-[#00BFFF]/40 bg-[#00BFFF]/10 text-[#00BFFF]">
              Appointment
            </Badge>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">{record.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Created {formatDateTime(record.created_at)}. Last updated {formatDateTime(record.updated_at)}.
            </p>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Date and time for this appointment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem label="Date" value={formatDate(record.scheduled_date)} icon={<CalendarDays className="h-3.5 w-3.5" />} />
            <DetailItem label="Time" value={formatTime(record.scheduled_time)} icon={<Clock3 className="h-3.5 w-3.5" />} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Client and main contact for the visit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem label="Company / Client" value={clientName} icon={<Building2 className="h-3.5 w-3.5" />} />
            <DetailItem label="Contact Person" value={contactPerson} icon={<UserRound className="h-3.5 w-3.5" />} />
            <DetailItem label="Telephone" value={telephone} icon={<Phone className="h-3.5 w-3.5" />} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Technician Assignment</CardTitle>
            <CardDescription>Assigned technician details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem label="Technician Assigned" value={record.technicians?.name || ''} icon={<Wrench className="h-3.5 w-3.5" />} />
            <DetailItem label="Additional Technicians" value={additionalTechnicians} icon={<Wrench className="h-3.5 w-3.5" />} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Visit address and landmark.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem label="Address" value={address} icon={<MapPin className="h-3.5 w-3.5" />} />
            <DetailItem label="Address Landmark" value={asText(parsedNotes.address_landmark)} icon={<MapPin className="h-3.5 w-3.5" />} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional appointment notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-lg border border-border bg-secondary/20 p-4 text-sm text-foreground">
              {noteText || 'No additional notes'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
