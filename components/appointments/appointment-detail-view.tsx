'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Pencil, Printer } from 'lucide-react'
import { EditAppointmentDialog } from '@/components/appointments/edit-appointment-dialog'
import { AppointmentTemplate } from '@/components/templates/appointment-template'
import { Button } from '@/components/ui/button'
import { buildJobWhatsAppUrl } from '@/lib/job-whatsapp'

interface AppointmentClient {
  id: string
  contact_name: string
  company_name: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  parish?: string | null
}

interface AppointmentTechnician {
  id: string
  name: string
}

interface AppointmentRecord {
  id: string
  client_id: string | null
  technician_id: string | null
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

interface AppointmentDetailViewProps {
  appointment: AppointmentRecord
  clients: AppointmentClient[]
  technicians: AppointmentTechnician[]
}

function asText(value: unknown) {
  if (typeof value === "string") return value.trim()
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
  if (!value) return 'Not Scheduled'

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
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function AppointmentDetailView({
  appointment,
  clients,
  technicians,
}: AppointmentDetailViewProps) {
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const templateRef = useRef<HTMLDivElement>(null)

  const parsedNotes = parseNotes(appointment.notes)
  const matchedClient = clients.find(
    (client) =>
      client.id === appointment.client_id ||
      client.company_name === appointment.clients?.company_name ||
      client.contact_name === appointment.clients?.contact_name
  )

  const clientName =
    appointment.clients?.company_name ||
    appointment.clients?.contact_name ||
    asText(parsedNotes.company_name) ||
    'Walk-in / Unassigned'
  const contactPerson = asText(parsedNotes.contact_person) || appointment.clients?.contact_name || clientName
  const telephone = asText(parsedNotes.telephone) || appointment.clients?.phone || matchedClient?.phone || ''
  const serviceAddress =
    appointment.address ||
    [appointment.clients?.address, appointment.clients?.city, appointment.clients?.parish].filter(Boolean).join(', ')
  const additionalTechnicians = Array.isArray(parsedNotes.additional_technicians)
    ? parsedNotes.additional_technicians.map((entry) => asText(entry)).filter(Boolean).join(', ')
    : ''
  const noteText = appointment.description || parsedNotes.free_text || ''
  const whatsappUrl = buildJobWhatsAppUrl({
    phone: telephone,
    title: appointment.title,
    clientName,
    contactPerson,
    scheduledDate: appointment.scheduled_date,
    scheduledTime: appointment.scheduled_time,
    address: serviceAddress,
    technicianName: appointment.technicians?.name || '',
    status: appointment.status,
    description: noteText || null,
  })

  const appointmentData = {
    appointment_number: `APPT-${appointment.id.slice(0, 8).toUpperCase()}`,
    created_date: formatDateTime(appointment.created_at),
    scheduled_date: formatDate(appointment.scheduled_date),
    scheduled_time: formatTime(appointment.scheduled_time),
    status: formatLabel(appointment.status),
    priority: formatLabel(appointment.priority),
    title: appointment.title,
    client: {
      name: contactPerson,
      company: clientName === contactPerson ? '' : clientName,
      address: serviceAddress,
      city: '',
      parish: '',
    },
    contact_person: contactPerson,
    telephone,
    address_landmark: asText(parsedNotes.address_landmark),
    technician: appointment.technicians?.name || '',
    additional_technicians: additionalTechnicians,
    notes: noteText,
  }

  function handlePrint() {
    const body = document.body

    const cleanup = () => {
      body.classList.remove('document-print-mode')
    }

    body.classList.add('document-print-mode')
    window.addEventListener('afterprint', cleanup, { once: true })

    requestAnimationFrame(() => {
      window.print()
      window.setTimeout(cleanup, 1000)
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/appointments')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Pencil className="h-4 w-4" />
            Edit Appointment
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 border-border"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="gap-2 border-emerald-600 text-emerald-400 hover:bg-emerald-600/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              disabled
              className="gap-2 border-emerald-600/40 text-emerald-400/60"
            >
              <MessageCircle className="h-4 w-4" />
              Client phone required
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-secondary/10 p-4 print:border-0 print:bg-transparent print:p-0">
        <div className="document-print-root mx-auto w-fit">
          <AppointmentTemplate ref={templateRef} data={appointmentData} />
        </div>
      </div>

      <EditAppointmentDialog
        appointment={appointment}
        clients={clients}
        technicians={technicians}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
