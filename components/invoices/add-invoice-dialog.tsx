'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Loader2, Link2, MapPin, Trash2 } from 'lucide-react'

interface Client {
  id: string
  contact_name: string
  company_name: string | null
  address?: string
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  discount: number
  total: number
}

interface AddInvoiceDialogProps {
  clients: Client[]
}

export function AddInvoiceDialog({ clients }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [contactPerson, setContactPerson] = useState('')
  const [serviceLocation, setServiceLocation] = useState('')
  const [address, setAddress] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('COD')
  const [poNumber, setPoNumber] = useState('')
  const [trn, setTrn] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, discount: 0, total: 0 }
  ])
  const [jobTimeline, setJobTimeline] = useState('')
  const [isServiceContract, setIsServiceContract] = useState(false)
  const [recurringSchedule, setRecurringSchedule] = useState('one-time')
  const [notes, setNotes] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const invoiceNumber = `INV-${100500 + Math.floor(Math.random() * 1000)}`

  const calculateItemTotal = (item: LineItem) => {
    return (item.quantity * item.unit_price) - item.discount
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total: 0
    }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        updated.total = calculateItemTotal(updated)
        return updated
      }
      return item
    }))
  }

  const addSection = () => {
    setLineItems([...lineItems, {
      id: `section-${Date.now()}`,
      description: '--- New Section ---',
      quantity: 0,
      unit_price: 0,
      discount: 0,
      total: 0
    }])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

    const total = calculateTotal()

    const { error } = await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      title: serviceDescription,
      client_id: selectedClient || null,
      items: lineItems,
      subtotal: total,
      tax_rate: 0,
      tax_amount: 0,
      discount: lineItems.reduce((sum, item) => sum + item.discount, 0),
      total,
      balance_due: total,
      status: 'draft',
      issued_date: invoiceDate,
      notes: JSON.stringify({
        contact_person: contactPerson,
        service_location: serviceLocation,
        address,
        payment_terms: paymentTerms,
        po_number: poNumber,
        trn,
        job_timeline: jobTimeline,
        is_service_contract: isServiceContract,
        recurring_schedule: recurringSchedule,
        notes
      }),
    })

    if (error) {
      toast.error('Failed to create invoice')
      setLoading(false)
      return
    }

    toast.success('Invoice created successfully')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a4a] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white text-xl">New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Row 1: Invoice Number + Invoice Date + Company */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Invoice Number</Label>
              <Input
                value={invoiceNumber}
                readOnly
                className="bg-[#00BCD4] border-[#00BCD4] text-black font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="bg-[#2a2a4a] border-[#3a3a5a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Company</Label>
              <div className="flex gap-2">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-white">
                        {client.company_name || client.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Row 2: Contact Person + Service Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Contact Person</Label>
              <div className="flex gap-2">
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contact person name"
                  className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
                />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00] hover:text-[#FF8C00]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Service Location</Label>
              <div className="flex gap-2">
                <Select value={serviceLocation} onValueChange={setServiceLocation}>
                  <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1">
                    <SelectValue placeholder="Select or type location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                    <SelectItem value="kingston" className="text-white">Kingston</SelectItem>
                    <SelectItem value="montego-bay" className="text-white">Montego Bay</SelectItem>
                    <SelectItem value="ocho-rios" className="text-white">Ocho Rios</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Address</Label>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Select or type address"
                className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
              />
              <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00] hover:text-[#FF8C00]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Row 4: Payment Terms + PO Number + TRN */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a4a] border-[#3a3a5a]">
                  <SelectItem value="COD" className="text-white">COD</SelectItem>
                  <SelectItem value="Net 15" className="text-white">Net 15</SelectItem>
                  <SelectItem value="Net 30" className="text-white">Net 30</SelectItem>
                  <SelectItem value="Net 60" className="text-white">Net 60</SelectItem>
                  <SelectItem value="50% Deposit" className="text-white">50% Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">PO Number</Label>
              <div className="flex gap-2">
                <Input
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="PO Number"
                  className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
                />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00] hover:text-[#FF8C00]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#E91E63] text-sm">TRN</Label>
              <div className="flex gap-2">
                <Input
                  value={trn}
                  onChange={(e) => setTrn(e.target.value)}
                  placeholder="TRN"
                  className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
                />
                <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00] hover:text-[#FF8C00]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Service Description</Label>
            <Input
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Type or select service description"
              className="bg-[#2a2a4a] border-[#3a3a5a] text-white"
            />
          </div>

          {/* Line Items Section */}
          <div className="space-y-2 border border-[#3a3a5a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-gray-300 text-sm">Line Items</Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={addSection} className="text-[#00BCD4] text-xs">
                  + Section
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="text-[#00BCD4] text-xs">
                  + Item
                </Button>
              </div>
            </div>
            
            {lineItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-r from-[#E91E63] via-[#FF6B00] to-[#FFD700] text-white text-xs px-2 py-1 rounded min-w-[120px]">
                  Service Description
                </div>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Type or select service descript"
                  className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
                />
                <Button type="button" variant="ghost" size="icon" className="text-[#00BCD4]" onClick={addLineItem}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => removeLineItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-[#3a3a5a]">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={addSection} className="text-[#00BCD4] text-xs">
                  + Section
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="text-[#00BCD4] text-xs">
                  + Item
                </Button>
              </div>
              <div className="text-[#FF6B00] font-semibold">
                Total: JMD {calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Job Completion Timeline */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Job Completion Timeline (Day)</Label>
            <div className="flex gap-2">
              <Input
                value={jobTimeline}
                onChange={(e) => setJobTimeline(e.target.value)}
                placeholder="e.g. 2-3 business days, 1 week"
                className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
              />
              <Button type="button" variant="ghost" size="icon" className="text-[#FF6B00] hover:text-[#FF8C00]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Service Contract Toggle + Recurring Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={isServiceContract}
                onCheckedChange={setIsServiceContract}
                className="data-[state=checked]:bg-[#00BCD4]"
              />
              <Label className="text-gray-300 text-sm">Service Contract</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Recurring Schedule</Label>
              <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white">
                  <SelectValue />
                </SelectTrigger>
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
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[80px]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="border-[#3a3a5a] text-white hover:bg-[#2a2a4a]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
