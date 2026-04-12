'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IncidentReportForm } from '@/components/incident-reports/incident-report-form'
import { IncidentReportPreview } from '@/components/incident-reports/incident-report-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadIncidentReportPdf } from '@/lib/incident-pdf-download'
import { 
  createDefaultDraft, 
  type IncidentReportDraft,
  type IncidentReportPdfData 
} from '@/lib/incident-reports'
import { ArrowLeft, Download, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function NewIncidentReportPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [draft, setDraft] = useState<IncidentReportDraft>(createDefaultDraft())
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, contact_name, company_name, address, city, parish')
        .order('company_name')
      
      if (data) setClients(data)
    }
    loadClients()
  }, [supabase])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const pdfData: IncidentReportPdfData = {
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
      
      await downloadIncidentReportPdf(pdfData)
      toast.success('Incident Report generated and downloaded')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleSave = async () => {
    if (!draft.title || !draft.clientName) {
      toast.error('Title and Client Name are required')
      return
    }

    setLoading(true)
    try {
      const { data: report, error } = await supabase
        .from('client_reports')
        .insert({
          title: draft.title,
          report_number: draft.reportNumber || `IR-${Date.now().toString().slice(-6)}`,
          client_id: draft.selectedClientId || null,
          report_type: 'incident',
          prepared_for: draft.contactPerson,
          contact_person: draft.contactPerson,
          client_name: draft.clientName,
          address: draft.address,
          report_date: draft.reportDate,
          sections: draft.sections.map(s => ({
            heading: s.heading,
            points: s.points.map(p => p.text).filter(Boolean)
          })),
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      
      toast.success('Incident Report saved successfully')
      router.push('/admin/client-reports')
    } catch (error) {
      console.error(error)
      toast.error('Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Generate Incident Report</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2 bg-[#19459a] hover:bg-[#19459a]/90 text-white">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 h-[calc(100vh-160px)]">
          <Card className="h-full border-slate-200">
            <Tabs defaultValue="edit" className="flex flex-col h-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit Details</TabsTrigger>
                  <TabsTrigger value="settings">Configuration</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="edit" className="flex-1 overflow-auto p-6 mt-0">
                <IncidentReportForm value={draft} onChange={setDraft} clients={clients} />
              </TabsContent>
              
              <TabsContent value="settings" className="p-6">
                <div className="text-sm text-slate-500">
                  <p>Scale this system for other report types by adjusting constants and adding new templates.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 h-[calc(100vh-160px)]">
          <Card className="h-full overflow-hidden border-slate-200 bg-slate-50">
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">Live Preview (WYSIWYG)</span>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400" />
                 <div className="w-3 h-3 rounded-full bg-yellow-400" />
                 <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-210px)]">
              <div className="p-8 flex justify-center">
                <div className="scale-[0.8] origin-top shadow-2xl">
                  <IncidentReportPreview data={draft} />
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
