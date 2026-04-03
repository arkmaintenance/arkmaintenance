import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, clients(contact_name, company_name), technicians(name)')
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Calendar" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Calendar</h2>
          <p className="text-muted-foreground">
            View and manage scheduled jobs.
          </p>
        </div>

        <CalendarView jobs={jobs || []} />
      </div>
    </div>
  )
}
