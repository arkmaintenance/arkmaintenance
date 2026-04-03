'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuotationTemplate } from '@/components/templates/quotation-template'
import { downloadQuotationPdf } from '@/lib/client-pdf-download'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SendQuotationDialog } from '@/components/quotations/send-quotation-dialog'
import { ArrowLeft, Printer, Download, Send, FileText, Pencil, Plus, Trash2, Save, X, Link2, MapPin } from 'lucide-react'
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
  const [editedItems, setEditedItems] = useState<QuotationItem[]>([])
  const [editedTitle, setEditedTitle] = useState('')
  const [editedNotes, setEditedNotes] = useState('')
  const [editedTimeline, setEditedTimeline] = useState('')
  const [editedContactPerson, setEditedContactPerson] = useState('')
  const [editedServiceLocation, setEditedServiceLocation] = useState('')
  const [editedAddress, setEditedAddress] = useState('')
  const [editedPaymentTerms, setEditedPaymentTerms] = useState('COD')
  const [editedPoNumber, setEditedPoNumber] = useState('')
  const [editedTrn, setEditedTrn] = useState('')
  const [editedScopeOfWork, setEditedScopeOfWork] = useState('')
  const [editedIsServiceContract, setEditedIsServiceContract] = useState(false)
  const [editedRecurringSchedule, setEditedRecurringSchedule] = useState('one-time')
  const [editedValidUntil, setEditedValidUntil] = useState('')
  const [editedStatus, setEditedStatus] = useState('pending')
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
      // Parse items if they're stored as JSON string
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []
      const normalizedItems = items.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || item.rate || 0,
        discount: item.discount || 0,
        amount: item.amount || 0
      }))
      setEditedItems(normalizedItems)
      setEditedTitle(data.title || '')
      // Parse notes JSON if stored that way
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}
      setEditedNotes(parsedNotes.notes || (typeof data.notes === 'string' && !data.notes.startsWith('{') ? data.notes : '') || '')
      setEditedTimeline(parsedNotes.job_timeline || data.description || '3-5 Days')
      setEditedContactPerson(parsedNotes.contact_person || '')
      setEditedServiceLocation(parsedNotes.service_location || '')
      setEditedAddress(parsedNotes.address || data.clients?.address || '')
      setEditedPaymentTerms(parsedNotes.payment_terms || 'COD')
      setEditedPoNumber(parsedNotes.po_number || '')
      setEditedTrn(parsedNotes.trn || '')
      setEditedScopeOfWork(parsedNotes.scope_of_work || '')
      setEditedIsServiceContract(parsedNotes.is_service_contract || false)
      setEditedRecurringSchedule(parsedNotes.recurring_schedule || 'one-time')
      setEditedValidUntil(data.valid_until ? data.valid_until.split('T')[0] : '')
      setEditedStatus(data.status || 'pending')
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
    if (quotation) {
      const items = typeof quotation.items === 'string' ? JSON.parse(quotation.items) : quotation.items || []
      const normalizedItems = items.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || item.rate || 0,
        discount: item.discount || 0,
        amount: item.amount || 0
      }))
      setEditedItems(normalizedItems)
      setEditedTitle(quotation.title || '')
      let parsedNotes: any = {}
      try { parsedNotes = typeof quotation.notes === 'string' ? JSON.parse(quotation.notes) : {} } catch {}
      setEditedNotes(parsedNotes.notes || (typeof quotation.notes === 'string' && !quotation.notes.startsWith('{') ? quotation.notes : '') || '')
      setEditedTimeline(parsedNotes.job_timeline || quotation.description || '')
      setEditedContactPerson(parsedNotes.contact_person || '')
      setEditedServiceLocation(parsedNotes.service_location || '')
      setEditedAddress(parsedNotes.address || '')
      setEditedPaymentTerms(parsedNotes.payment_terms || 'COD')
      setEditedPoNumber(parsedNotes.po_number || '')
      setEditedTrn(parsedNotes.trn || '')
      setEditedScopeOfWork(parsedNotes.scope_of_work || '')
      setEditedIsServiceContract(parsedNotes.is_service_contract || false)
      setEditedRecurringSchedule(parsedNotes.recurring_schedule || 'one-time')
      setEditedValidUntil(quotation.valid_until ? quotation.valid_until.split('T')[0] : '')
      setEditedStatus(quotation.status || 'pending')
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!quotation) return
    setSaving(true)

    const subtotal = editedItems.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal

    const { error } = await supabase
      .from('quotations')
      .update({
        title: editedTitle,
        items: editedItems,
        subtotal,
        total,
        description: editedTimeline,
        status: editedStatus,
        valid_until: editedValidUntil || null,
        notes: JSON.stringify({
          contact_person: editedContactPerson,
          service_location: editedServiceLocation,
          address: editedAddress,
          payment_terms: editedPaymentTerms,
          po_number: editedPoNumber,
          trn: editedTrn,
          job_timeline: editedTimeline,
          is_service_contract: editedIsServiceContract,
          recurring_schedule: editedRecurringSchedule,
          scope_of_work: editedScopeOfWork,
          notes: editedNotes,
        }),
      })
      .eq('id', quotation.id)

    if (error) {
      toast.error('Failed to save changes')
      setSaving(false)
      return
    }

    setQuotation({
      ...quotation,
      title: editedTitle,
      items: editedItems,
      subtotal,
      total,
      description: editedTimeline,
      status: editedStatus,
    })

    toast.success('Quotation updated successfully')
    setIsEditing(false)
    setSaving(false)
  }

  const handleAddItem = () => {
    setEditedItems([...editedItems, { description: '', qty: 1, unit_price: 0, discount: 0, amount: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...editedItems]
    if (field === 'qty' || field === 'unit_price' || field === 'discount') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
      newItems[index][field] = numValue
      // Recalculate amount
      const baseAmount = newItems[index].qty * newItems[index].unit_price
      newItems[index].amount = baseAmount - (newItems[index].discount || 0)
    } else if (field === 'amount') {
      newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value
    } else {
      newItems[index][field] = value as string
    }
    setEditedItems(newItems)
  }

  const handleConvertToInvoice = async () => {
    if (!quotation) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    const invoiceNumber = `INV-${String((count || 0) + 100001).padStart(6, '0')}`

    const { error } = await supabase
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

    if (error) {
      toast.error('Failed to convert to invoice')
      return
    }

    toast.success('Quotation converted to invoice')
    router.push('/admin/invoices')
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

  const subtotal = editedItems.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal

  const quotationData = {
    quote_number: quotation.quote_number,
    date: new Date(quotation.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    payment_terms: '50% Deposit Required',
    service_description: isEditing ? editedTitle : (quotation.title || 'SERVICE QUOTATION'),
    timeline: isEditing ? editedTimeline : (quotation.description || '3-5 Days'),
    client: {
      name: quotation.clients?.contact_name || 'Client',
      company: quotation.clients?.company_name || '',
      address: quotation.clients?.address || '',
      city: quotation.clients?.city || '',
      email: quotation.clients?.email || ''
    },
    items: editedItems,
    subtotal: subtotal,
    total: total
  }

  async function handleDownloadPdf() {
    if (!quotation) return

    setDownloadingPdf(true)
    try {
      await downloadQuotationPdf(quotationData, `Quote-${quotation.quote_number}.pdf`)
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
      {isEditing && (
        <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-6 space-y-4 print:hidden">
          <h2 className="text-white text-xl font-semibold">Edit Quotation</h2>

          {/* Row 1: Quotation Number + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Quotation Number</Label>
              <Input value={quotation.quote_number} readOnly className="bg-[#00BCD4] border-[#00BCD4] text-black font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Client</Label>
              <Input value={quotation.clients?.company_name || quotation.clients?.contact_name || ''} readOnly className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
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
              <div className="col-span-4 text-xs text-gray-400">Description</div>
              <div className="col-span-2 text-xs text-gray-400">Qty</div>
              <div className="col-span-2 text-xs text-gray-400">Unit Price (JMD)</div>
              <div className="col-span-1 text-xs text-gray-400">Discount</div>
              <div className="col-span-2 text-xs text-gray-400">Amount</div>
              <div className="col-span-1" />
            </div>
            <div className="space-y-2">
              {editedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Service description" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" min={1} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" min={0} />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" min={0} />
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
              <Input value={editedTimeline} onChange={(e) => setEditedTimeline(e.target.value)} placeholder="e.g. 2-3 business days, 1 week" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
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

          {/* Scope of Work */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Scope of Work</Label>
            <Textarea value={editedScopeOfWork} onChange={(e) => setEditedScopeOfWork(e.target.value)} placeholder="Scope of work... select a template or type manually" className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[80px]" />
          </div>

          {/* Valid Until + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Valid Until</Label>
              <Input type="date" value={editedValidUntil} onChange={(e) => setEditedValidUntil(e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Status</Label>
              <Select value={editedStatus} onValueChange={setEditedStatus}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="sent" className="text-white">Sent</SelectItem>
                  <SelectItem value="accepted" className="text-white">Accepted</SelectItem>
                  <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                  <SelectItem value="expired" className="text-white">Expired</SelectItem>
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

      {/* Quotation Template Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <QuotationTemplate ref={templateRef} data={quotationData} />
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
