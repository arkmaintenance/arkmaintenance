import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { JobsTable } from '@/components/jobs/jobs-table'
import { AddJobDialog } from '@/components/jobs/add-job-dialog'

export default async function JobsPage() {
  const supabase = await createClient()
  
  const [
    { data: jobs },
    { data: clients },
    { data: technicians },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, clients(contact_name, company_name), technicians(name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, contact_name, company_name'),
    supabase.from('technicians').select('id, name'),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Jobs" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Job Management</h2>
            <p className="text-muted-foreground">
              Create and manage work orders and service jobs.
            </p>
          </div>
          <AddJobDialog clients={clients || []} technicians={technicians || []} />
        </div>

        <JobsTable jobs={jobs || []} />
      </div>
    </div>
  )
}
