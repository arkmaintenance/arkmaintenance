// Quotation detail + edit page
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuotationTemplate } from '@/components/templates/quotation-template'
import { downloadQuotationPdf } from '@/lib/client-pdf-download'
import { buildServiceDescription } from '@/lib/service-description'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EditDocumentForm, type EditFormValues } from '@/components/shared/edit-document-form'
import { SendQuotationDialog } from '@/components/quotations/send-quotation-dialog'
import { ArrowLeft, Printer, Download, Send, FileText, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount: number
  amount: number
}

interface Quotation {
  id: string
  quote_number: string
  title: string
  description: string
  items: QuotationItem[]
  subtotal: number
  total: number
  status: string
  valid_until: string
  notes: string
  created_at: string
  client_id: string
  clients: {
    contact_name: string
    company_name: string
    address: string
    city: string
    parish: string
    email: string
  } | null
}

export default function QuotationPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormValues, setEditFormValues] = useState<EditFormValues | null>(null)
  const [saving, setSaving] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState<string | undefined>()
  const templateRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchQuotation() {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          clients (
            contact_name,
            company_name,
            address,
            city,
            parish,
            email
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        toast.error('Failed to load quotation')
        router.push('/admin/quotations')
        return
      }

      setQuotation(data)
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []
      const normalizedItems = items.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || item.rate || 0,
        discount: item.discount || 0,
        amount: item.amount || item.total || (item.unit_price || item.rate || 0) * (item.qty || item.quantity || 1) - (item.discount || 0)
      }))
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}

      setEditFormValues({
        title: data.title || '',
        notes: parsedNotes.notes || (typeof data.notes === 'string' && !data.notes.startsWith('{') ? data.notes : '') || '',
        timeline: parsedNotes.job_timeline || data.description || '3-5 Days',
        contactPerson: parsedNotes.contact_person || '',
        serviceLocation: parsedNotes.service_location || '',
        address: parsedNotes.address || data.clients?.address || '',
        paymentTerms: parsedNotes.payment_terms || 'COD',
        paymentMethod: parsedNotes.payment_method || 'bank_transfer',
        poNumber: parsedNotes.po_number || '',
        trn: parsedNotes.trn || '',
        scopeOfWork: parsedNotes.scope_of_work || '',
        scopeOfWorkPoints: parsedNotes.scope_of_work_points || [],
        scopeTemplate: parsedNotes.scope_template || '',
        isServiceContract: parsedNotes.is_service_contract || false,
        recurringSchedule: parsedNotes.recurring_schedule || 'one-time',
        validUntil: data.valid_until ? data.valid_until.split('T')[0] : '',
        issuedDate: data.created_at ? data.created_at.split('T')[0] : '',
        dueDate: '',
        status: data.status || 'pending',
        items: normalizedItems,
        selectedClientId: data.clients?.company_name || '',
      })
      setClientEmail(data.clients?.email)
      setLoading(false)
    }

    fetchQuotation()
  }, [params.id, router, supabase])

  const handlePrint = () => {
    window.print()
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async (values: EditFormValues) => {
    if (!quotation) return
    setSaving(true)

    const subtotal = values.items.reduce((sum, item) => sum + (item.section ? 0 : item.amount), 0)

    const { error } = await supabase
      .from('quotations')
      .update({
        title: values.title,
        items: values.items,
        subtotal,
        total: subtotal,
        description: values.timeline,
        status: values.status,
        valid_until: values.validUntil || null,
        notes: JSON.stringify({
          contact_person: values.contactPerson,
          service_location: values.serviceLocation,
          address: values.address,
          payment_terms: values.paymentTerms,
          po_number: values.poNumber,
          trn: values.trn,
          job_timeline: values.timeline,
          is_service_contract: values.isServiceContract,
          recurring_schedule: values.recurringSchedule,
          scope_of_work: values.scopeOfWork,
          scope_template: values.scopeTemplate,
          notes: values.notes,
        }),
      })
      .eq('id', quotation.id)

    if (error) { toast.error('Failed to save changes'); setSaving(false); return }

    setQuotation({ ...quotation, title: values.title, items: values.items as any, subtotal, total: subtotal, description: values.timeline, status: values.status })
    setEditFormValues(values)
    toast.success('Quotation updated successfully')
    setIsEditing(false)
    setSaving(false)
  }

  const handleConvertToInvoice = async () => {
    if (!quotation) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: allInvs } = await supabase.from('invoices').select('invoice_number')
    const START = 100600
    let nextNum = START
    if (allInvs && allInvs.length > 0) {
      const nums = allInvs
        .map((r: any) => parseInt(String(r.invoice_number ?? '').replace(/\D/g, ''), 10))
        .filter((n: number) => !isNaN(n) && n >= START)
      if (nums.length > 0) nextNum = Math.max(...nums) + 1
    }
    const invoiceNumber = `INV-${nextNum}`

    const { data: newInvoice, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: quotation.client_id || null,
        quotation_id: quotation.id,
        invoice_number: invoiceNumber,
        title: quotation.title,
        items: quotation.items,
        subtotal: quotation.subtotal,
        total: quotation.total,
        balance_due: quotation.total,
        status: 'draft',
        issued_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: quotation.notes
      })
      .select('id')
      .single()

    if (error) {
      toast.error('Failed to convert to invoice')
      return
    }

    toast.success('Quotation converted to invoice')
    router.push(`/admin/invoices/${newInvoice.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFFF]"></div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Quotation not found</p>
      </div>
    )
  }

  const activeValues = editFormValues
  const subtotal = (activeValues?.items || []).reduce((sum, item) => sum + (item.section ? 0 : item.amount), 0)
  const total = subtotal
  const serviceDescription = buildServiceDescription(
    activeValues?.title || quotation.title,
    activeValues?.serviceLocation,
    'SERVICE QUOTATION',
  )

  const quotationData = {
    quote_number: quotation.quote_number,
    date: new Date((activeValues?.issuedDate || quotation.created_at.split('T')[0]) + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    payment_terms: activeValues?.paymentTerms || 'COD',
    service_description: serviceDescription,
    timeline: activeValues?.timeline || quotation.description || '3-5 Days',
    isServiceContract: activeValues?.isServiceContract || false,
    recurringSchedule: activeValues?.recurringSchedule || 'one-time',
    scopeTemplate: activeValues?.scopeTemplate || '',
    scopeOfWork: activeValues?.scopeOfWork || '',
    scopeOfWorkPoints: (activeValues as any)?.scopeOfWorkPoints || [],
    client: {
      name: activeValues?.contactPerson || quotation.clients?.contact_name || 'Client',
      company: quotation.clients?.company_name || '',
      address: activeValues?.address || quotation.clients?.address || '',
      city: quotation.clients?.city || '',
      email: quotation.clients?.email || ''
    },
    items: activeValues?.items || [],
    subtotal,
    total,
  }

  async function handleDownloadPdf() {
    if (!quotation) return

    setDownloadingPdf(true)
    try {
      const dateStr = new Date(quotation.created_at).toISOString().split('T')[0]
      const clientName = quotation.clients?.company_name || quotation.clients?.contact_name || 'Client'
      const jobDesc = serviceDescription
      const safeFileName = `Quote-${quotation.quote_number}${jobDesc ? `-${jobDesc}` : ''}.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

      await downloadQuotationPdf(quotationData, safeFileName)
      toast.success('Quotation PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download quotation PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/quotations')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotations
        </Button>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Quotation
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
              >
                <Download className="h-4 w-4" />
                {downloadingPdf ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button variant="outline" onClick={handleConvertToInvoice} className="gap-2">
                <FileText className="h-4 w-4" />
                Convert to Invoice
              </Button>
              <Button 
                className="gap-2 bg-[#00BFFF] hover:bg-[#00BFFF]/90"
                onClick={() => setSendDialogOpen(true)}
              >
                <Send className="h-4 w-4" />
                Send to Client
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && editFormValues && (
        <EditDocumentForm
          docType="quotation"
          docNumber={quotation.quote_number}
          docDate={new Date(quotation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          initialValues={editFormValues}
          saving={saving}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Quotation Template Preview */}
      <div className="overflow-x-auto rounded-xl border border-border bg-secondary/10 p-4">
        <div className="mx-auto w-fit">
          <QuotationTemplate ref={templateRef} data={quotationData} />
        </div>
      </div>

      {/* Send Quotation Dialog */}
      <SendQuotationDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        quotationData={quotationData}
        clientEmail={clientEmail}
      />
    </div>
  )
}
