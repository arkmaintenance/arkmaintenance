'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { downloadClientReportPdf } from '@/lib/client-pdf-download'
import { downloadIncidentReportPdf } from '@/lib/incident-pdf-download'
import {
  buildClientReportDraftFromRecord,
  buildClientReportPdfData,
  getClientReportFilename,
  type ClientReportRecordLike,
} from '@/lib/client-reports'
import { toast } from 'sonner'
import { Download, Eye, Search, Trash2 } from 'lucide-react'

interface ClientReportTableRow extends ClientReportRecordLike {
  id: string
  report_number: string
  title: string
  report_date: string | null
  status: string | null
  created_at: string | null
}

interface ClientReportsTableProps {
  reports: ClientReportTableRow[]
}

export function ClientReportsTable({ reports }: ClientReportsTableProps) {
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return reports
    }

    return reports.filter((report) => {
      const draft = buildClientReportDraftFromRecord(report)
      return (
        report.report_number.toLowerCase().includes(query)
        || report.title.toLowerCase().includes(query)
        || draft.clientName.toLowerCase().includes(query)
        || draft.contactPerson.toLowerCase().includes(query)
      )
    })
  }, [reports, search])

  async function handleDownload(report: ClientReportTableRow) {
    setDownloadingId(report.id)

    try {
      const draft = buildClientReportDraftFromRecord(report)
      
      if (report.report_type === 'incident') {
        const pdfData = {
          title: draft.title,
          report_date: new Date(draft.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          client_name: draft.clientName,
          contact_person: draft.contactPerson,
          address: draft.address,
          sections: draft.sections.map(s => ({
            heading: s.heading,
            points: s.points.map(p => p.text).filter(Boolean)
          }))
        }
        await downloadIncidentReportPdf(pdfData, getClientReportFilename(draft))
      } else {
        await downloadClientReportPdf(buildClientReportPdfData(draft), getClientReportFilename(draft))
      }
      
      toast.success('Report PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download report PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleDelete(reportId: string) {
    setDeletingId(reportId)

    try {
      const { error } = await supabase.from('client_reports').delete().eq('id', reportId)

      if (error) {
        throw new Error(error.message || 'Failed to delete client report')
      }

      toast.success('Client report deleted')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete client report')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {search
              ? 'No client reports found matching your search.'
              : 'No client reports yet. Create your first client report to get started.'}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <TableHead className="text-foreground font-medium">Report #</TableHead>
                  <TableHead className="text-foreground font-medium">Title</TableHead>
                  <TableHead className="text-foreground font-medium">Client</TableHead>
                  <TableHead className="text-foreground font-medium">Date</TableHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const draft = buildClientReportDraftFromRecord(report)

                  return (
                    <TableRow
                      key={report.id}
                      className="border-border hover:bg-secondary/30 cursor-pointer"
                      onClick={() => router.push(`/admin/client-reports/${report.id}`)}
                    >
                      <TableCell className="font-medium text-[#FF6B00]">{report.report_number}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{report.title}</p>
                          <p className="text-xs text-muted-foreground">{draft.contactPerson || 'No contact person'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-[#00BFFF]">{draft.clientName || 'Client'}</p>
                          {draft.address ? <p className="text-xs text-muted-foreground line-clamp-1">{draft.address}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {draft.reportDate ? new Date(draft.reportDate).toLocaleDateString('en-US') : '-'}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/admin/client-reports/${report.id}`)}
                            title="View report"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId === report.id}
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(report.id)}
                            disabled={deletingId === report.id}
                            title="Delete report"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
