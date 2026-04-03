import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { ClientsTable } from '@/components/clients/clients-table'
import { AddClientDialog } from '@/components/clients/add-client-dialog'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Clients" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Client Management</h2>
            <p className="text-muted-foreground">
              Manage your customers and their information.
            </p>
          </div>
          <AddClientDialog />
        </div>

        <ClientsTable clients={clients || []} />
      </div>
    </div>
  )
}
