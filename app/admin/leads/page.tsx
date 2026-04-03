import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { LeadsTable } from '@/components/leads/leads-table'
import { AddLeadDialog } from '@/components/leads/add-lead-dialog'

export default async function LeadsPage() {
  const supabase = await createClient()
  
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Leads" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
            <p className="text-muted-foreground">
              Track and manage potential customers.
            </p>
          </div>
          <AddLeadDialog />
        </div>

        <LeadsTable leads={leads || []} />
      </div>
    </div>
  )
}
