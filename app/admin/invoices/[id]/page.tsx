'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceTemplate } from '@/components/templates/invoice-template'
import { downloadInvoicePdf } from '@/lib/client-pdf-download'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog'
import { ArrowLeft, Printer, Download, Send, Pencil, Plus, Trash2, Save, X, Copy, DollarSign, MessageCircle } from 'lucide-react'
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

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([])
  const [editedTitle, setEditedTitle] = useState('')
  const [editedNotes, setEditedNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState<string | undefined>()
  const [markingPaid, setMarkingPaid] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

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
      const normalizedItems = items.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || item.rate || 0,
        amount: item.amount || 0
      }))
      setEditedItems(normalizedItems)
      setEditedTitle(data.title || '')
      setEditedNotes(data.notes || '')
      setClientEmail(data.clients?.email)
      setLoading(false)
    }

    fetchInvoice()
  }, [params.id, router, supabase])

  const handlePrint = () => {
    window.print()
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    // Reset to original values
    if (invoice) {
      const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items || []
      const normalizedItems = items.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || item.quantity || 1,
        unit_price: item.unit_price || item.rate || 0,
        amount: item.amount || 0
      }))
      setEditedItems(normalizedItems)
      setEditedTitle(invoice.title || '')
      setEditedNotes(invoice.notes || '')
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!invoice) return
    setSaving(true)

    // Recalculate totals
    const subtotal = editedItems.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal // Add tax calculation if needed

    const { error } = await supabase
      .from('invoices')
      .update({
        title: editedTitle,
        items: editedItems,
        subtotal,
        total,
        balance_due: total - (Number(invoice.total) - Number(invoice.balance_due)),
        notes: editedNotes
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
      title: editedTitle,
      items: editedItems,
      subtotal,
      total,
      balance_due: total - (Number(invoice.total) - Number(invoice.balance_due)),
      notes: editedNotes
    })

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
      title: invoice.title,
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

  const whatsappMessage = invoice ? encodeURIComponent(`Hi, please find your invoice ${invoice.invoice_number} for JMD ${Number(invoice.total).toLocaleString()}. Thank you.`) : ''
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`

  // Calculate subtotal and total from edited items
  const subtotal = editedItems.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal

  const invoiceData = {
    invoice_number: invoice.invoice_number,
    date: new Date(invoice.issued_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    payment_terms: 'COD',
    service_description: isEditing ? editedTitle : (invoice.title || 'AIR CONDITIONER SERVICING AND MAINTENANCE'),
    client: {
      name: invoice.clients?.contact_name || 'Client',
      company: invoice.clients?.company_name || '',
      address: invoice.clients?.address || '',
      city: invoice.clients?.city || '',
      parish: invoice.clients?.parish || '',
      email: invoice.clients?.email || ''
    },
    items: isEditing ? editedItems : editedItems,
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
              <Button variant="outline" onClick={handleStartEdit} className="gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDuplicate} className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2 border-border">
                <Printer className="h-4 w-4" />
                Print
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
        <Card className="bg-card border-border print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Edit Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Description */}
            <div className="space-y-2">
              <Label htmlFor="title">Service Description / Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-input border-border"
                placeholder="e.g., AIR CONDITIONER SERVICING AND MAINTENANCE"
              />
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
                    <div className="col-span-5">
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="bg-input border-border min-h-[100px]"
                placeholder="Additional notes..."
              />
            </div>
          </CardContent>
        </Card>
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
