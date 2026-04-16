'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Pencil, Printer } from 'lucide-react'
import { JobTemplate } from '@/components/templates/job-template'
import { Button } from '@/components/ui/button'
import { buildJobWhatsAppUrl } from '@/lib/job-whatsapp'

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
  contact_person?: unknown
  location?: unknown
  department?: unknown
  supplier?: unknown
  materials?: unknown
  tech_charge?: unknown
  line_items?: unknown
  recurring_schedule?: unknown
  is_service_contract?: unknown
  whatsapp_number?: unknown
  telephone?: unknown
  company_name?: unknown
  free_text?: string
}

interface JobDetailViewProps {
  job: JobDetailRecord
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

export function JobDetailView({ job }: JobDetailViewProps) {
  const router = useRouter()
  const templateRef = useRef<HTMLDivElement>(null)

  const parsedNotes = parseNotes(job.notes)
  const lineItems = normalizeLineItems(parsedNotes.line_items)
  const clientName =
    job.clients?.company_name ||
    job.clients?.contact_name ||
    asText(parsedNotes.company_name) ||
    'Walk-in / Unassigned'
  const contactPerson = asText(parsedNotes.contact_person) || job.clients?.contact_name || clientName
  const clientPhone = asText(parsedNotes.whatsapp_number) || asText(parsedNotes.telephone) || job.clients?.phone || ''
  const clientAddress =
    job.address ||
    [job.clients?.address, job.clients?.city, job.clients?.parish].filter(Boolean).join(', ')
  const noteText = job.description || parsedNotes.free_text || ''
  const whatsappUrl = buildJobWhatsAppUrl({
    phone: clientPhone,
    title: job.title,
    clientName,
    contactPerson,
    scheduledDate: job.scheduled_date,
    scheduledTime: job.scheduled_time,
    address: clientAddress,
    technicianName: job.technicians?.name || '',
    status: job.status,
    description: noteText,
    lineItems,
  })
  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const jobData = {
    job_number: `JOB-${job.id.slice(0, 8).toUpperCase()}`,
    created_date: formatDateTime(job.created_at),
    scheduled_date: formatDate(job.scheduled_date),
    scheduled_time: formatTime(job.scheduled_time),
    status: formatLabel(job.status),
    priority: formatLabel(job.priority),
    job_type: formatLabel(job.job_type),
    title: job.title,
    client: {
      name: contactPerson,
      company: clientName === contactPerson ? '' : clientName,
      address: clientAddress,
      city: '',
      parish: '',
    },
    contact_person: contactPerson,
    telephone: clientPhone,
    technician: job.technicians?.name || '',
    location: asText(parsedNotes.location),
    department: asText(parsedNotes.department),
    supplier: asText(parsedNotes.supplier),
    materials: asText(parsedNotes.materials),
    tech_charge: asText(parsedNotes.tech_charge),
    recurring_schedule: job.is_recurring
      ? formatLabel(asText(parsedNotes.recurring_schedule) || 'Recurring')
      : 'One-time',
    is_service_contract: parsedNotes.is_service_contract === true,
    notes: noteText,
    items: lineItems,
    total,
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
          onClick={() => router.push('/admin/jobs')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Link href={`/admin/jobs/${job.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Job
            </Link>
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
          <JobTemplate ref={templateRef} data={jobData} />
        </div>
      </div>
    </div>
  )
}
