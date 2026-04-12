'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ClientReportForm } from '@/components/client-reports/client-report-form'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import {
  buildLegacyClientReportFields,
  createDefaultClientReportDraft,
  serializeClientReportSections,
  type ClientReportClientOption,
  type ClientReportDraft,
} from '@/lib/client-reports'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface AddClientReportDialogProps {
  clients: ClientReportClientOption[]
}

function getNextReportNumber(reportNumbers: Array<string | null | undefined>) {
  const START = 1000
  let next = START

  const parsed = reportNumbers
    .map((value) => {
      const match = String(value || '').match(/(\d+)/)
      return match ? Number(match[1]) : Number.NaN
    })
    .filter((value) => Number.isFinite(value) && value >= START)

  if (parsed.length > 0) {
    next = Math.max(...parsed) + 1
  }

  return `RPT-${next}`
}

export function AddClientReportDialog({ clients: initialClients }: AddClientReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientReportClientOption[]>(initialClients)
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientLoadError, setClientLoadError] = useState<string | null>(null)
  const [draft, setDraft] = useState<ClientReportDraft>(createDefaultClientReportDraft())
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) {
      return
    }

    async function loadData() {
      setClientsLoading(true)
      setClientLoadError(null)

      const [{ data: clientsData, error: clientsError }, { data: reportData, error: reportError }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, contact_name, company_name, address, city, parish')
          .order('company_name'),
        supabase
          .from('client_reports')
          .select('report_number')
          .order('created_at', { ascending: false }),
      ])

      if (clientsError) {
        setClientLoadError(clientsError.message || 'Failed to load clients')
      } else {
        setClients((clientsData || []) as ClientReportClientOption[])
      }

      if (reportError) {
        toast.error(reportError.message || 'Failed to prepare report number')
      } else {
        setDraft(
          createDefaultClientReportDraft(
            getNextReportNumber(
              ((reportData || []) as Array<{ report_number?: string | null }>).map((item) => item.report_number)
            )
          )
        )
      }

      setClientsLoading(false)
    }

    loadData()
  }, [open, supabase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      const cleanedSections = serializeClientReportSections(draft.sections)
      const legacyFields = buildLegacyClientReportFields(draft.sections)

      const { data: createdReport, error } = await supabase
        .from('client_reports')
        .insert({
          user_id: user.id,
          report_number: draft.reportNumber,
          title: draft.title.trim() || 'Client Report',
          client_id: draft.selectedClientId || null,
          report_type: 'custom',
          prepared_for: draft.contactPerson.trim() || null,
          contact_person: draft.contactPerson.trim() || null,
          client_name: draft.clientName.trim() || null,
          address: draft.address.trim() || null,
          report_date: draft.reportDate || null,
          sections: cleanedSections,
          observations: legacyFields.observations,
          root_cause: legacyFields.root_cause,
          recommendations: legacyFields.recommendations,
          conclusion: legacyFields.conclusion,
          status: 'draft',
        })
        .select('id')
        .single()

      if (error || !createdReport) {
        throw new Error(error?.message || 'Failed to create client report')
      }

      toast.success('Client report created')
      setOpen(false)
      router.push(`/admin/client-reports/${createdReport.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create client report')
    } finally {
      setLoading(false)
    }
  }

  function handleQuickAddSuccess(client: ClientReportClientOption) {
    setClients((current) => {
      const next = [...current, client]
      next.sort((a, b) => {
        const left = a.company_name || a.contact_name || ''
        const right = b.company_name || b.contact_name || ''
        return left.localeCompare(right)
      })
      return next
    })

    setDraft((current) => ({
      ...current,
      selectedClientId: client.id,
      clientName: client.company_name || client.contact_name || current.clientName,
      contactPerson: client.contact_name || current.contactPerson,
      address: [client.address, client.city, client.parish].filter(Boolean).join(', ') || current.address,
    }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            New Client Report
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl border-border bg-card max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Client Report</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ClientReportForm
              value={draft}
              onChange={setDraft}
              clients={clients}
              clientsLoading={clientsLoading}
              clientLoadError={clientLoadError}
              onAddClientClick={() => setQuickAddOpen(true)}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Report'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <QuickAddClientDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />
    </>
  )
}
