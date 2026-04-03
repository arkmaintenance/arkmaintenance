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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SendQuotationDialog } from '@/components/quotations/send-quotation-dialog'
import { ArrowLeft, Printer, Download, Send, FileText, Pencil, Plus, Trash2, Save, X } from 'lucide-react'
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
      setEditedNotes(data.notes || '')
      setEditedTimeline(data.description || '3-5 Days')
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
      setEditedNotes(quotation.notes || '')
      setEditedTimeline(quotation.description || '')
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
        notes: editedNotes
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
      notes: editedNotes
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
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
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
        <Card className="bg-card border-border print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Edit Quotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Description */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Description / Title</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-input border-border"
                  placeholder="e.g., EXHAUST SYSTEM DEEP CLEANING"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Job Completion Timeline</Label>
                <Input
                  id="timeline"
                  value={editedTimeline}
                  onChange={(e) => setEditedTimeline(e.target.value)}
                  className="bg-input border-border"
                  placeholder="e.g., 3-5 Days"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {editedItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/30 rounded-lg">
                    <div className="col-span-4">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="bg-input border-border"
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="bg-input border-border"
                        min={1}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Unit Price (JMD)</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="bg-input border-border"
                        min={0}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs text-muted-foreground">Discount</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        className="bg-input border-border"
                        min={0}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <Input
                        value={`JMD ${item.amount.toLocaleString()}`}
                        readOnly
                        className="bg-secondary border-border text-muted-foreground"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 bg-secondary/30 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">JMD {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-[#FF6B00]">JMD {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Scope of Work</Label>
              <Textarea
                id="notes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="bg-input border-border min-h-[100px]"
                placeholder="Additional notes or scope of work details..."
              />
            </div>
          </CardContent>
        </Card>
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
