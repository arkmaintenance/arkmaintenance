import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { CalendarManager } from '@/components/calendar/calendar-manager'

export default async function CalendarPage() {
  const supabase = await createClient()

  const [
    { data: jobs },
    { data: clients },
    { data: technicians },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, title, status, priority, job_type, scheduled_date, scheduled_time, clients(contact_name, company_name), technicians(name)')
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true }),
    supabase.from('clients').select('id, contact_name, company_name, address, city, parish').order('company_name'),
    supabase.from('technicians').select('id, name').order('name'),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Calendar" />
      <div className="p-6">
        <CalendarManager
          records={(jobs || []) as any}
          clients={(clients || []) as any}
          technicians={(technicians || []) as any}
        />
      </div>
    </div>
  )
}
