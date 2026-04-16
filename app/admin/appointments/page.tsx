import { DashboardHeader } from '@/components/dashboard/header'
import { AddAppointmentDialog } from '@/components/calendar/add-appointment-dialog'
import { AppointmentsTable } from '@/components/appointments/appointments-table'
import { createClient } from '@/lib/supabase/server'

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const [
    { data: appointments },
    { data: clients },
    { data: technicians },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, client_id, technician_id, title, description, status, priority, scheduled_date, scheduled_time, address, notes, created_at, clients(contact_name, company_name), technicians(name)')
      .eq('job_type', 'appointment')
      .order('scheduled_date', { ascending: true }),
    supabase.from('clients').select('id, contact_name, company_name, phone, address, city, parish').order('company_name'),
    supabase.from('technicians').select('id, name').order('name'),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Appointments" />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
            <p className="text-muted-foreground">
              View, edit, and manage scheduled appointments.
            </p>
          </div>
          <AddAppointmentDialog clients={(clients || []) as any} technicians={(technicians || []) as any} />
        </div>

        <AppointmentsTable
          appointments={(appointments || []) as any}
          clients={(clients || []) as any}
          technicians={(technicians || []) as any}
        />
      </div>
    </div>
  )
}
