import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { TechniciansTable } from '@/components/technicians/technicians-table'
import { AddTechnicianDialog } from '@/components/technicians/add-technician-dialog'

export default async function TechniciansPage() {
  const supabase = await createClient()
  
  const { data: technicians } = await supabase
    .from('technicians')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Technicians" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Technician Management</h2>
            <p className="text-muted-foreground">
              Manage your technicians and their assignments.
            </p>
          </div>
          <AddTechnicianDialog />
        </div>

        <TechniciansTable technicians={technicians || []} />
      </div>
    </div>
  )
}
