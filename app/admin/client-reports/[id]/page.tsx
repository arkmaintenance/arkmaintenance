'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ClientReportForm } from '@/components/client-reports/client-report-form'
import { ClientReportPreview } from '@/components/client-reports/client-report-preview'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { downloadClientReportPdf } from '@/lib/client-pdf-download'
import { downloadIncidentReportPdf } from '@/lib/incident-pdf-download'
import { IncidentReportPreview } from '@/components/incident-reports/incident-report-preview'
import {
  buildClientReportDraftFromRecord,
  buildClientReportPdfData,
  buildLegacyClientReportFields,
  getClientReportFilename,
  serializeClientReportSections,
  type ClientReportClientOption,
  type ClientReportDraft,
  type ClientReportRecordLike,
} from '@/lib/client-reports'
import { ArrowLeft, Download, Loader2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'

interface ClientReportRecord extends ClientReportRecordLike {
  id: string
  report_number: string
  title: string
  client_id: string | null
  report_date: string | null
  status: string | null
  created_at: string | null
}

export default function ClientReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id
  const supabase = createClient()

  const [report, setReport] = useState<ClientReportRecord | null>(null)
  const [draft, setDraft] = useState<ClientReportDraft | null>(null)
  const [clients, setClients] = useState<ClientReportClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    async function loadPage() {
      if (!reportId) {
        toast.error('Invalid client report')
        router.push('/admin/client-reports')
        return
      }

      setLoading(true)

      const [{ data: reportData, error: reportError }, { data: clientsData, error: clientsError }] = await Promise.all([
        supabase
          .from('client_reports')
          .select(`
            id,
            report_number,
            title,
            client_id,
            report_type,
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
          .eq('id', reportId)
          .single(),
        supabase
          .from('clients')
          .select('id, contact_name, company_name, address, city, parish')
          .order('company_name'),
      ])

      if (reportError || !reportData) {
        toast.error(reportError?.message || 'Failed to load client report')
        router.push('/admin/client-reports')
        return
      }

      if (clientsError) {
        toast.error(clientsError.message || 'Failed to load clients')
      }

      setReport(reportData as ClientReportRecord)
      setDraft(buildClientReportDraftFromRecord(reportData as ClientReportRecord))
      setClients((clientsData || []) as ClientReportClientOption[])
      setLoading(false)
    }

    loadPage()
  }, [reportId, router, supabase])

  const previewDraft = useMemo(() => {
    if (draft) {
      return draft
    }

    if (report) {
      return buildClientReportDraftFromRecord(report)
    }

    return null
  }, [draft, report])

  async function handleDownloadPdf() {
    if (!previewDraft) {
      return
    }

    setDownloading(true)

    try {
      if (report?.report_type === 'incident') {
        const pdfData = {
          title: previewDraft.title,
          report_date: new Date(previewDraft.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          client_name: previewDraft.clientName,
          contact_person: previewDraft.contactPerson,
          address: previewDraft.address,
          sections: previewDraft.sections.map(s => ({
            heading: s.heading,
            points: s.points.map(p => p.text).filter(Boolean)
          }))
        }
        await downloadIncidentReportPdf(pdfData, getClientReportFilename(previewDraft))
      } else {
        await downloadClientReportPdf(
          buildClientReportPdfData(previewDraft),
          getClientReportFilename(previewDraft)
        )
      }
      toast.success('Report PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download report PDF')
    } finally {
      setDownloading(false)
    }
  }

  async function handleSave() {
    if (!report || !draft) {
      return
    }

    setSaving(true)

    try {
      const cleanedSections = serializeClientReportSections(draft.sections)
      const legacyFields = buildLegacyClientReportFields(draft.sections)

      const { data: updatedReport, error } = await supabase
        .from('client_reports')
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id)
        .select(`
          id,
          report_number,
          title,
          client_id,
          report_type,
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
        .single()

      if (error || !updatedReport) {
        throw new Error(error?.message || 'Failed to update client report')
      }

      setReport(updatedReport as ClientReportRecord)
      setDraft(buildClientReportDraftFromRecord(updatedReport as ClientReportRecord))
      setIsEditing(false)
      toast.success('Client report updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update client report')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    if (report) {
      setDraft(buildClientReportDraftFromRecord(report))
    }

    setIsEditing(false)
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

    setDraft((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        selectedClientId: client.id,
        clientName: client.company_name || client.contact_name || current.clientName,
        contactPerson: client.contact_name || current.contactPerson,
        address: [client.address, client.city, client.parish].filter(Boolean).join(', ') || current.address,
      }
    })
  }

  if (loading || !previewDraft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00BFFF]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/client-reports')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Client Reports
        </Button>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Report'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Report
              </Button>
              <Button onClick={handleDownloadPdf} disabled={downloading} className="gap-2 bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <ClientReportForm
              value={draft || previewDraft}
              onChange={setDraft}
              clients={clients}
              onAddClientClick={() => setQuickAddOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)] min-h-[780px]">
              <div className="bg-slate-100 p-4 sm:p-6 overflow-auto">
                {report?.report_type === 'incident' ? (
                  <div className="scale-[0.85] origin-top">
                    <IncidentReportPreview data={previewDraft as any} />
                  </div>
                ) : (
                  <ClientReportPreview data={previewDraft} />
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <QuickAddClientDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  )
}
