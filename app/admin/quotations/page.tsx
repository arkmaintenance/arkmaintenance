import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { QuotationsTable } from '@/components/quotations/quotations-table'
import { AddQuotationDialog } from '@/components/quotations/add-quotation-dialog'

export default async function QuotationsPage() {
  const supabase = await createClient()
  
  const [
    { data: quotations },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from('quotations')
      .select('*, clients(contact_name, company_name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, contact_name, company_name, address, city, parish'),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Quotations" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quotation Management</h2>
            <p className="text-muted-foreground">
              Create and manage customer quotations.
            </p>
          </div>
          <AddQuotationDialog clients={clients || []} />
        </div>

        <QuotationsTable quotations={quotations || []} />
      </div>
    </div>
  )
}
