// Invoice detail + edit page
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceTemplate } from '@/components/templates/invoice-template'
import { downloadInvoicePdf, printInvoicePdf } from '@/lib/client-pdf-download'
import { getInvoiceJobSubject } from '@/lib/invoice-job-subject'
import { buildServiceDescription } from '@/lib/service-description'
import { buildWhatsAppSendUrl } from '@/lib/job-whatsapp'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EditDocumentForm, type EditFormValues } from '@/components/shared/edit-document-form'
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog'
import { ArrowLeft, Printer, Download, Send, Pencil, Copy, DollarSign, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface InvoiceItem {
  description: string
  qty: number
  unit_price: number
  amount: number
}

interface Invoice {
  id: string
  invoice_number: string
  title: string
  items: InvoiceItem[]
  subtotal: number
  total: number
  balance_due: number
  status: string
  due_date: string
  issued_date: string
  notes: string
  clients: {
    contact_name: string
    company_name: string
    address: string
    city: string
    parish: string
    email: string
    phone: string | null
  } | null
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormValues, setEditFormValues] = useState<EditFormValues | null>(null)
  const [saving, setSaving] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [printingPdf, setPrintingPdf] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState<string | undefined>()
  const [markingPaid, setMarkingPaid] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const getCleanInvoiceTitle = (title: string | null | undefined) => getInvoiceJobSubject(title, {
    invoiceNumber: invoice?.invoice_number,
    clientName: invoice?.clients?.contact_name,
    companyName: invoice?.clients?.company_name,
  })

  useEffect(() => {
    async function fetchInvoice() {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            contact_name,
            company_name,
            address,
            city,
            parish,
            email,
            phone
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        toast.error('Failed to load invoice')
        router.push('/admin/invoices')
        return
      }

      setInvoice(data)
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []
      const normalizedItems = items.map((item: any) => {
        const qty = Number(item.qty || item.quantity || 1)
        const unit_price = Number(item.unit_price || item.rate || 0)
        return { description: item.description || '', qty, unit_price, discount: 0, amount: qty * unit_price }
      })
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}

      setEditFormValues({
        title: getInvoiceJobSubject(data.title, { invoiceNumber: data.invoice_number, clientName: data.clients?.contact_name, companyName: data.clients?.company_name }),
        notes: parsedNotes.notes || (typeof data.notes === 'string' && !data.notes.startsWith('{') ? data.notes : '') || '',
        timeline: parsedNotes.job_timeline || '',
        contactPerson: parsedNotes.contact_person || '',
        serviceLocation: parsedNotes.service_location || '',
        address: parsedNotes.address || data.clients?.address || '',
        paymentTerms: parsedNotes.payment_terms || 'COD',
        paymentMethod: parsedNotes.payment_method || '',
        poNumber: parsedNotes.po_number || '',
        trn: parsedNotes.trn || '',
        scopeOfWork: '',
        scopeOfWorkPoints: [],
        scopeTemplate: '',
        isServiceContract: parsedNotes.is_service_contract || false,
        recurringSchedule: parsedNotes.recurring_schedule || 'one-time',
        validUntil: '',
        issuedDate: data.issued_date ? data.issued_date.split('T')[0] : '',
        dueDate: data.due_date ? data.due_date.split('T')[0] : '',
        status: data.status || 'draft',
        items: normalizedItems,
        selectedClientId: data.clients?.company_name || '',
      })
      setClientEmail(data.clients?.email)
      setLoading(false)
    }

    fetchInvoice()
  }, [params.id, router, supabase])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => { setIsEditing(false) }

  const handleSave = async (values: EditFormValues) => {
    if (!invoice) return
    setSaving(true)
    const cleanedTitle = getCleanInvoiceTitle(values.title)
    const recalculatedItems = values.items.map(item => ({ ...item, amount: item.qty * item.unit_price - (item.discount || 0) }))
    const subtotal = recalculatedItems.reduce((sum, item) => sum + (item.section ? 0 : item.amount), 0)

    const { error } = await supabase.from('invoices').update({
      title: cleanedTitle,
      items: recalculatedItems,
      subtotal,
      total: subtotal,
      balance_due: subtotal - (Number(invoice.total) - Number(invoice.balance_due)),
      issued_date: values.issuedDate || invoice.issued_date,
      due_date: values.dueDate || invoice.due_date,
      notes: JSON.stringify({
        contact_person: values.contactPerson,
        service_location: values.serviceLocation,
        address: values.address,
        payment_terms: values.paymentTerms,
        payment_method: values.paymentMethod,
        po_number: values.poNumber,
        trn: values.trn,
        job_timeline: values.timeline,
        is_service_contract: values.isServiceContract,
        recurring_schedule: values.recurringSchedule,
        notes: values.notes,
      }),
    }).eq('id', invoice.id)

    if (error) { toast.error('Failed to save changes'); setSaving(false); return }

    setInvoice({ ...invoice, title: cleanedTitle, items: recalculatedItems as any, subtotal, total: subtotal, balance_due: subtotal - (Number(invoice.total) - Number(invoice.balance_due)) })
    setEditFormValues(values)
    toast.success('Invoice updated successfully')
    setIsEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFFF]"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  async function handleMarkPaid() {
    if (!invoice) return
    setMarkingPaid(true)
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', amount_paid: invoice.total, balance_due: 0 })
      .eq('id', invoice.id)
    if (error) { toast.error('Failed to mark as paid') }
    else {
      toast.success('Invoice marked as paid')
      setInvoice({ ...invoice, status: 'paid', balance_due: 0 })
    }
    setMarkingPaid(false)
  }

  async function handleDuplicate() {
    if (!invoice) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
    const newNum = `INV-${String((count || 0) + 100001).padStart(6, '0')}`
    const { error } = await supabase.from('invoices').insert({
      user_id: user.id,
      client_id: (invoice as any).client_id || null,
      invoice_number: newNum,
      title: getCleanInvoiceTitle(invoice.title),
      items: invoice.items,
      subtotal: invoice.subtotal,
      total: invoice.total,
      balance_due: invoice.total,
      status: 'draft',
      issued_date: new Date().toISOString().split('T')[0],
      notes: invoice.notes,
    })
    if (error) { toast.error('Failed to duplicate'); return }
    toast.success('Invoice duplicated')
    router.push('/admin/invoices')
  }

  async function handleDownloadPdf() {
    if (!invoice) return

    setDownloadingPdf(true)
    try {
      const dateStr = new Date(invoice.issued_date || (invoice as any).created_at).toISOString().split('T')[0]
      const clientName = invoice.clients?.company_name || invoice.clients?.contact_name || 'Client'
      const jobDesc = serviceDescription
      const safeFileName = `${invoice.invoice_number} - ${clientName}${jobDesc ? ` - ${jobDesc}` : ''} - ${dateStr}.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

      await downloadInvoicePdf(invoiceData, safeFileName)
      toast.success('Invoice PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handlePrint() {
    if (!invoice) return

    setPrintingPdf(true)
    try {
      await printInvoicePdf(invoiceData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to print invoice PDF')
    } finally {
      setPrintingPdf(false)
    }
  }

  const whatsappMessage = invoice
    ? `Hi, please find your invoice ${invoice.invoice_number} for JMD ${Number(invoice.total).toLocaleString()}. Thank you.`
    : ''
  const whatsappUrl = buildWhatsAppSendUrl(whatsappMessage, invoice?.clients?.phone)

  // Calculate subtotal and total from current form values
  const activeItems = editFormValues?.items || []
  const calculatedItems = activeItems.map(item => ({ ...item, amount: item.qty * item.unit_price - (item.discount || 0) }))
  const subtotal = calculatedItems.reduce((sum, item) => sum + (item.section ? 0 : item.amount), 0)
  const total = subtotal
  const serviceDescription = buildServiceDescription(
    getCleanInvoiceTitle(editFormValues?.title || invoice.title),
    editFormValues?.serviceLocation,
    'AIR CONDITIONER SERVICING AND MAINTENANCE',
  )

  const invoiceData = {
    invoice_number: invoice.invoice_number,
    date: new Date((editFormValues?.issuedDate || invoice.issued_date) + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    due_date: editFormValues?.dueDate
      ? new Date(editFormValues.dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : invoice.due_date
        ? new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
    payment_terms: editFormValues?.paymentTerms || 'COD',
    payment_method: editFormValues?.paymentMethod || '',
    service_description: serviceDescription,
    isServiceContract: editFormValues?.isServiceContract || false,
    recurringSchedule: editFormValues?.recurringSchedule || 'one-time',
    timeline: editFormValues?.timeline || '3 Days',
    client: {
      name: editFormValues?.contactPerson || invoice.clients?.contact_name || 'Client',
      company: invoice.clients?.company_name || '',
      address: editFormValues?.address || invoice.clients?.address || '',
      city: invoice.clients?.city || '',
      parish: invoice.clients?.parish || '',
      email: invoice.clients?.email || ''
    },
    items: calculatedItems,
    subtotal: subtotal,
    total: total,
    balance_due: isEditing ? total : Number(invoice.balance_due) || 0
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/invoices')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleStartEdit} className="gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDuplicate} className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={printingPdf} className="gap-2 border-border">
                <Printer className="h-4 w-4" />
                {printingPdf ? 'Printing...' : 'Print'}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
              >
                <Download className="h-4 w-4" />
                {downloadingPdf ? 'Downloading...' : 'PDF'}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                onClick={handleMarkPaid}
                disabled={markingPaid || invoice?.status === 'paid'}
              >
                <DollarSign className="h-4 w-4" />
                {markingPaid ? 'Saving...' : 'Mark Paid'}
              </Button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 border-emerald-600 text-emerald-400 hover:bg-emerald-600/10">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <Button
                className="gap-2 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold"
                onClick={() => setSendDialogOpen(true)}
              >
                <Send className="h-4 w-4" />
                Email
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && editFormValues && (
        <EditDocumentForm
          docType="invoice"
          docNumber={invoice.invoice_number}
          docDate={new Date(invoice.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          initialValues={editFormValues}
          saving={saving}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}




      {/* Invoice Template Preview */}
      <div className="overflow-x-auto rounded-xl border border-border bg-secondary/10 p-4">
        <div className="mx-auto w-fit">
          <InvoiceTemplate ref={templateRef} data={invoiceData} />
        </div>
      </div>

      {/* Send Invoice Dialog */}
      <SendInvoiceDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        invoiceData={invoiceData}
        clientEmail={clientEmail}
      />
    </div>
  )
}
