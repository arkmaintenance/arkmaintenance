import { notFound, redirect } from 'next/navigation'
import { JobDetailView } from '@/components/jobs/job-detail-view'
import { createClient } from '@/lib/supabase/server'

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
}

function parseNotes(notes: unknown): ParsedJobNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedJobNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedJobNotes
  } catch {
    return {}
  }
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

  const record = job as unknown as JobDetailRecord
  const parsedNotes = parseNotes(record.notes)
  const isAppointment = record.job_type === 'appointment' || parsedNotes.appointment === true

  if (isAppointment) {
    redirect(`/admin/appointments/${record.id}`)
  }

  return <JobDetailView job={record} />
}
