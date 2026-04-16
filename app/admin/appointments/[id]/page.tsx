import { notFound, redirect } from 'next/navigation'
import { AppointmentDetailView } from '@/components/appointments/appointment-detail-view'
import { createClient } from '@/lib/supabase/server'

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
}

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

function parseNotes(notes: unknown): ParsedAppointmentNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedAppointmentNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedAppointmentNotes
  } catch {
    return {}
  }
}

export default async function AppointmentDetailPage({ params }: { params: any }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params
  const supabase = await createClient()

  const [
    { data, error },
    { data: clients },
    { data: technicians },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select(`
        id,
        client_id,
        technician_id,
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
      .single(),
    supabase.from('clients').select('id, contact_name, company_name, phone, address, city, parish').order('company_name'),
    supabase.from('technicians').select('id, name').order('name'),
  ])

  if (error || !data) {
    notFound()
  }

  const record = data as unknown as AppointmentRecord
  const parsedNotes = parseNotes(record.notes)
  const isAppointment = record.job_type === 'appointment' || parsedNotes.appointment === true

  if (!isAppointment) {
    redirect(`/admin/jobs/${record.id}`)
  }

  return (
    <AppointmentDetailView
      appointment={record}
      clients={(clients || []) as AppointmentClient[]}
      technicians={(technicians || []) as AppointmentTechnician[]}
    />
  )
}
