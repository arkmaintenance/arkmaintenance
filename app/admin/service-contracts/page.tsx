import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { ServiceContractsClient } from '@/components/service-contracts/service-contracts-client'

export default async function ServiceContractsPage() {
  const supabase = await createClient()
  
  const { data: contracts } = await supabase
    .from('service_contracts')
    .select('*, clients(contact_name, company_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Service Contracts" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Service Contracts</h2>
            <p className="text-muted-foreground">
              Manage maintenance and service agreements.
            </p>
          </div>
        </div>
        <ServiceContractsClient contracts={contracts || []} />
      </div>
    </div>
  )
}
