'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceTemplate } from '@/components/templates/invoice-template'
import { downloadInvoicePdf, printInvoicePdf } from '@/lib/client-pdf-download'
import { getInvoiceJobSubject } from '@/lib/invoice-job-subject'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog'
import { ArrowLeft, Printer, Download, Send, Pencil, Plus, Trash2, Save, X, Copy, DollarSign, MessageCircle, MapPin } from 'lucide-react'
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
  } | null
}

const calculateLineAmount = (item: Partial<InvoiceItem>) => Number(item.qty || 0) * Number(item.unit_price || 0)

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([])
  const [editedTitle, setEditedTitle] = useState('')
  const [editedNotes, setEditedNotes] = useState('')
  const [editedContactPerson, setEditedContactPerson] = useState('')
  const [editedServiceLocation, setEditedServiceLocation] = useState('')
  const [editedAddress, setEditedAddress] = useState('')
  const [editedPaymentTerms, setEditedPaymentTerms] = useState('COD')
  const [editedPoNumber, setEditedPoNumber] = useState('')
  const [editedTrn, setEditedTrn] = useState('')
  const [editedIsServiceContract, setEditedIsServiceContract] = useState(false)
  const [editedRecurringSchedule, setEditedRecurringSchedule] = useState('one-time')
  const [editedJobTimeline, setEditedJobTimeline] = useState('')
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
            email
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
      // Parse items if they're stored as JSON string
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []
      // Normalize items to use consistent field names
      const normalizedItems = items.map((item: any) => {
        const qty = Number(item.qty || item.quantity || 1)
        const unit_price = Number(item.unit_price || item.rate || 0)

        return {
          description: item.description || '',
          qty,
          unit_price,
          amount: calculateLineAmount({ qty, unit_price }),
        }
      })
      setEditedItems(normalizedItems)
      setEditedTitle(getInvoiceJobSubject(data.title, {
        invoiceNumber: data.invoice_number,
        clientName: data.clients?.contact_name,
        companyName: data.clients?.company_name,
      }))
      // Parse notes JSON
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}
      setEditedNotes(parsedNotes.notes || (typeof data.notes === 'string' && !data.notes.startsWith('{') ? data.notes : '') || '')
      setEditedContactPerson(parsedNotes.contact_person || '')
      setEditedServiceLocation(parsedNotes.service_location || '')
      setEditedAddress(parsedNotes.address || data.clients?.address || '')
      setEditedPaymentTerms(parsedNotes.payment_terms || 'COD')
      setEditedPoNumber(parsedNotes.po_number || '')
      setEditedTrn(parsedNotes.trn || '')
      setEditedIsServiceContract(parsedNotes.is_service_contract || false)
      setEditedRecurringSchedule(parsedNotes.recurring_schedule || 'one-time')
      setEditedJobTimeline(parsedNotes.job_timeline || '')
      setClientEmail(data.clients?.email)
      setLoading(false)
    }

    fetchInvoice()
  }, [params.id, router, supabase])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    // Reset to original values
    if (invoice) {
      const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items || []
      const normalizedItems = items.map((item: any) => {
        const qty = Number(item.qty || item.quantity || 1)
        const unit_price = Number(item.unit_price || item.rate || 0)
        return { description: item.description || '', qty, unit_price, amount: calculateLineAmount({ qty, unit_price }) }
      })
      setEditedItems(normalizedItems)
      setEditedTitle(getCleanInvoiceTitle(invoice.title))
      let parsedNotes: any = {}
      try { parsedNotes = typeof invoice.notes === 'string' ? JSON.parse(invoice.notes) : {} } catch {}
      setEditedNotes(parsedNotes.notes || (typeof invoice.notes === 'string' && !invoice.notes.startsWith('{') ? invoice.notes : '') || '')
      setEditedContactPerson(parsedNotes.contact_person || '')
      setEditedServiceLocation(parsedNotes.service_location || '')
      setEditedAddress(parsedNotes.address || '')
      setEditedPaymentTerms(parsedNotes.payment_terms || 'COD')
      setEditedPoNumber(parsedNotes.po_number || '')
      setEditedTrn(parsedNotes.trn || '')
      setEditedIsServiceContract(parsedNotes.is_service_contract || false)
      setEditedRecurringSchedule(parsedNotes.recurring_schedule || 'one-time')
      setEditedJobTimeline(parsedNotes.job_timeline || '')
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!invoice) return
    setSaving(true)
    const cleanedTitle = getCleanInvoiceTitle(editedTitle)

    // Recalculate totals
    const recalculatedItems = editedItems.map((item) => ({
      ...item,
      amount: calculateLineAmount(item),
    }))
    const subtotal = recalculatedItems.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal

    const { error } = await supabase
      .from('invoices')
      .update({
        title: cleanedTitle,
        items: recalculatedItems,
        subtotal,
        total,
        balance_due: total - (Number(invoice.total) - Number(invoice.balance_due)),
        notes: JSON.stringify({
          contact_person: editedContactPerson,
          service_location: editedServiceLocation,
          address: editedAddress,
          payment_terms: editedPaymentTerms,
          po_number: editedPoNumber,
          trn: editedTrn,
          job_timeline: editedJobTimeline,
          is_service_contract: editedIsServiceContract,
          recurring_schedule: editedRecurringSchedule,
          notes: editedNotes,
        }),
      })
      .eq('id', invoice.id)

    if (error) {
      toast.error('Failed to save changes')
      setSaving(false)
      return
    }

    // Update local state
    setInvoice({
      ...invoice,
      title: cleanedTitle,
      items: recalculatedItems,
      subtotal,
      total,
      balance_due: total - (Number(invoice.total) - Number(invoice.balance_due)),
    })
    setEditedItems(recalculatedItems)

    toast.success('Invoice updated successfully')
    setIsEditing(false)
    setSaving(false)
  }

  const handleAddItem = () => {
    setEditedItems([...editedItems, { description: '', qty: 1, unit_price: 0, amount: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...editedItems]
    if (field === 'qty' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
      newItems[index][field] = numValue
      // Recalculate amount
      newItems[index].amount = newItems[index].qty * newItems[index].unit_price
    } else if (field === 'amount') {
      newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value
    } else {
      newItems[index][field] = value as string
    }
    setEditedItems(newItems)
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
      await downloadInvoicePdf(invoiceData, `Invoice-${invoice.invoice_number}.pdf`)
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

  const whatsappMessage = invoice ? encodeURIComponent(`Hi, please find your invoice ${invoice.invoice_number} for JMD ${Number(invoice.total).toLocaleString()}. Thank you.`) : ''
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`

  // Calculate subtotal and total from edited items
  const calculatedItems = editedItems.map((item) => ({
    ...item,
    amount: calculateLineAmount(item),
  }))
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal
  const serviceDescription = getCleanInvoiceTitle(isEditing ? editedTitle : invoice.title)

  const invoiceData = {
    invoice_number: invoice.invoice_number,
    date: new Date(invoice.issued_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    payment_terms: editedPaymentTerms || 'COD',
    service_description: serviceDescription,
    client: {
      name: invoice.clients?.contact_name || 'Client',
      company: invoice.clients?.company_name || '',
      address: invoice.clients?.address || '',
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
      {isEditing && (
        <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-6 space-y-4 print:hidden">
          <h2 className="text-white text-xl font-semibold">Edit Invoice</h2>

          {/* Row 1: Invoice Number + Invoice Date + Company */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Invoice Number</Label>
              <Input value={invoice.invoice_number} readOnly className="bg-[#00BCD4] border-[#00BCD4] text-black font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Invoice Date</Label>
              <Input value={invoice.issued_date} readOnly className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Client</Label>
              <Input value={invoice.clients?.company_name || invoice.clients?.contact_name || ''} readOnly className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
          </div>

          {/* Row 2: Contact Person + Service Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Contact Person</Label>
              <div className="flex gap-2">
                <Input value={editedContactPerson} onChange={(e) => setEditedContactPerson(e.target.value)} placeholder="Contact person name" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00]"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Service Location</Label>
              <div className="flex gap-2">
                <Select value={editedServiceLocation} onValueChange={setEditedServiceLocation}>
                  <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1">
                    <SelectValue placeholder="Select or type location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                    <SelectItem value="kingston" className="text-white">Kingston</SelectItem>
                    <SelectItem value="montego-bay" className="text-white">Montego Bay</SelectItem>
                    <SelectItem value="ocho-rios" className="text-white">Ocho Rios</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white"><MapPin className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Address</Label>
            <div className="flex gap-2">
              <Input value={editedAddress} onChange={(e) => setEditedAddress(e.target.value)} placeholder="Select or type address" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
              <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00]"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Row 4: Payment Terms + PO Number + TRN */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Payment Terms</Label>
              <Select value={editedPaymentTerms} onValueChange={setEditedPaymentTerms}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                  <SelectItem value="COD" className="text-white">COD</SelectItem>
                  <SelectItem value="Net 15" className="text-white">Net 15</SelectItem>
                  <SelectItem value="Net 30" className="text-white">Net 30</SelectItem>
                  <SelectItem value="Net 60" className="text-white">Net 60</SelectItem>
                  <SelectItem value="50% Deposit" className="text-white">50% Deposit</SelectItem>
                  <SelectItem value="7 Days" className="text-white">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">PO Number</Label>
              <div className="flex gap-2">
                <Input value={editedPoNumber} onChange={(e) => setEditedPoNumber(e.target.value)} placeholder="PO Number" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00]"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#E91E63] text-sm">TRN</Label>
              <div className="flex gap-2">
                <Input value={editedTrn} onChange={(e) => setEditedTrn(e.target.value)} placeholder="TRN" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00]"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Service Description</Label>
            <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} placeholder="Type or select service description" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
          </div>

          {/* Line Items */}
          <div className="space-y-2 border border-[#3a3a5a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-gray-300 text-sm">Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddItem} className="text-[#00BCD4] text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 mb-1 px-1">
              <div className="col-span-5 text-xs text-gray-400">Description</div>
              <div className="col-span-2 text-xs text-gray-400">Qty</div>
              <div className="col-span-2 text-xs text-gray-400">Unit Price (JMD)</div>
              <div className="col-span-2 text-xs text-gray-400">Amount</div>
              <div className="col-span-1" />
            </div>
            <div className="space-y-2">
              {editedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Service description" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" min={1} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" min={0} />
                  </div>
                  <div className="col-span-2">
                    <Input value={`JMD ${item.amount.toLocaleString()}`} readOnly className="bg-[#3a3a5a] border-[#3a3a5a] text-gray-300" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#3a3a5a]">
              <Button type="button" variant="ghost" size="sm" onClick={handleAddItem} className="text-[#00BCD4] text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
              <div className="text-[#FF6B00] font-semibold">Total: JMD {subtotal.toLocaleString()}</div>
            </div>
          </div>

          {/* Job Completion Timeline */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Job Completion Timeline (Day)</Label>
            <div className="flex gap-2">
              <Input value={editedJobTimeline} onChange={(e) => setEditedJobTimeline(e.target.value)} placeholder="e.g. 2-3 business days, 1 week" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
              <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00]"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Service Contract Toggle + Recurring Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={editedIsServiceContract} onCheckedChange={setEditedIsServiceContract} className="data-[state=checked]:bg-[#00BCD4]" />
              <Label className="text-gray-300 text-sm">Service Contract</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Recurring Schedule</Label>
              <Select value={editedRecurringSchedule} onValueChange={setEditedRecurringSchedule}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                  <SelectItem value="one-time" className="text-white">One-time</SelectItem>
                  <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                  <SelectItem value="bi-weekly" className="text-white">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                  <SelectItem value="quarterly" className="text-white">Quarterly</SelectItem>
                  <SelectItem value="semi-annual" className="text-white">Semi-Annual</SelectItem>
                  <SelectItem value="annual" className="text-white">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Notes</Label>
            <Textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[80px]" />
          </div>

          {/* Save / Cancel */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancelEdit} className="border-[#3a3a5a] text-white hover:bg-[#2a2a4a] gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold gap-2">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Invoice Template Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <InvoiceTemplate ref={templateRef} data={invoiceData} />
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
