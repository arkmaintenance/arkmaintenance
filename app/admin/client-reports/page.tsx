import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { AddClientReportDialog } from '@/components/client-reports/add-client-report-dialog'
import { ClientReportsTable } from '@/components/client-reports/client-reports-table'
import { Button } from '@/components/ui/button'

export default async function ClientReportsPage() {
  const supabase = await createClient()

  const [
    { data: reports, error: reportsError },
    { data: clients, error: clientsError },
  ] = await Promise.all([
    supabase
      .from('client_reports')
      .select(`
        id,
        report_number,
        title,
        client_id,
        prepared_for,
        contact_person,
        client_name,
        address,
        report_date,
        observations,
        root_cause,
        recommendations,
        conclusion,
        sections,
        status,
        created_at,
        updated_at,
        clients (
          contact_name,
          company_name,
          address,
          city,
          parish
        )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, contact_name, company_name, address, city, parish')
      .order('company_name'),
  ])

  if (reportsError) {
    throw new Error(reportsError.message || 'Failed to load client reports')
  }

  if (clientsError) {
    throw new Error(clientsError.message || 'Failed to load clients')
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Client Reports" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Client Reports</h2>
            <p className="text-muted-foreground">
              Create saved client reports, open them as HTML previews, and download matching PDFs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/admin/reports/incident/new">New Incident Report</a>
            </Button>
            <AddClientReportDialog clients={(clients || []) as any} />
          </div>
        </div>

        <ClientReportsTable reports={(reports || []) as any} />
      </div>
    </div>
  )
}
