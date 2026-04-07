import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { InvoicesTable } from '@/components/invoices/invoices-table'
import { AddInvoiceDialog } from '@/components/invoices/add-invoice-dialog'

export default async function InvoicesPage() {
  const supabase = await createClient()
  
  const [
    { data: invoices },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(contact_name, company_name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, contact_name, company_name, address, city, parish'),
  ])

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Invoices" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl ojk font-bold text-foreground">Invoice Management</h2>
            <p className="text-muted-foreground">
              Create and manage customer invoices.
            </p>
          </div>
          <AddInvoiceDialog clients={clients || []} />
        </div>

        <InvoicesTable invoices={invoices || []} />
      </div>
    </div>
  )
}
