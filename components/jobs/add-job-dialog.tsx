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
import { Plus, Loader2, Trash2 } from 'lucide-react'

interface Client {
  id: string
  contact_name: string
  company_name: string | null
}

interface Technician {
  id: string
  name: string
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

interface AddJobDialogProps {
  clients: Client[]
  technicians: Technician[]
}

export function AddJobDialog({ clients, technicians }: AddJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [techCharge, setTechCharge] = useState('')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [supplier, setSupplier] = useState('')
  const [materials, setMaterials] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobType, setJobType] = useState('repair')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('scheduled')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [recurringSchedule, setRecurringSchedule] = useState('one-time')
  const [isServiceContract, setIsServiceContract] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 }
  ])
  const [specialNotes, setSpecialNotes] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  function addLineItem() {
    setLineItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 }])
  }

  function removeLineItem(id: string) {
    if (lineItems.length > 1) setLineItems(prev => prev.filter(i => i.id !== id))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jobTitle) { toast.error('Job title is required'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be logged in'); setLoading(false); return }

    const { error } = await supabase.from('jobs').insert({
      user_id: user.id,
      title: jobTitle,
      description: specialNotes || null,
      job_type: jobType,
      status,
      priority,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      address: clientAddress || null,
      client_id: selectedClient || null,
      technician_id: selectedTechnician || null,
      is_recurring: recurringSchedule !== 'one-time',
      recurring_frequency: recurringSchedule,
      is_service_contract: isServiceContract,
      notes: JSON.stringify({
        contact_person: contactPerson,
        location,
        department,
        supplier,
        materials,
        tech_charge: techCharge,
        line_items: lineItems,
      }),
    })

    if (error) { toast.error('Failed to create job'); setLoading(false); return }
    toast.success('Job created successfully')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  const inputCls = 'bg-[#1e2235] border-[#2d3352] text-white placeholder:text-gray-500 focus-visible:ring-[#00BFFF]/40'
  const labelCls = 'text-gray-400 text-xs uppercase tracking-wide font-medium'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#13172a] border-[#2d3352] max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#1a3a5c] via-[#2a1a5c] to-[#5c1a1a] px-6 py-4 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">New Job</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Job Title */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Job Title *</Label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Type or select job title"
              className={inputCls}
              required
            />
          </div>

          {/* Row 2: Company + Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Company / Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-white">
                      {c.company_name || c.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Contact Person</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contact person name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3: Client Address */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Client Address</Label>
            <Input
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Service address"
              className={inputCls}
            />
          </div>

          {/* Row 4: Technician + Tech Charge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Technician</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-white">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Tech Charge (JMD)</Label>
              <Input
                value={techCharge}
                onChange={(e) => setTechCharge(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 5: Location + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Service location"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department (optional)"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 6: Supplier & Materials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Supplier</Label>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier name"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Materials</Label>
              <Input
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Parts / materials used"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 7: Job Type + Priority + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                  <SelectItem value="repair" className="text-white">Repair</SelectItem>
                  <SelectItem value="maintenance" className="text-white">Maintenance</SelectItem>
                  <SelectItem value="installation" className="text-white">Installation</SelectItem>
                  <SelectItem value="inspection" className="text-white">Inspection</SelectItem>
                  <SelectItem value="emergency" className="text-white">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                  <SelectItem value="scheduled" className="text-white">Scheduled</SelectItem>
                  <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="completed" className="text-white">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 8: Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Scheduled Date</Label>
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Scheduled Time</Label>
              <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Row 9: Recurring + Service Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Recurring Schedule</Label>
              <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e2235] border-[#2d3352]">
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
            <div className="flex items-end gap-3 pb-0.5">
              <Switch
                checked={isServiceContract}
                onCheckedChange={setIsServiceContract}
                className="data-[state=checked]:bg-[#00BFFF]"
              />
              <Label className="text-gray-300 text-sm">Service Contract</Label>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={labelCls}>Service Description / Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="text-[#00BFFF] text-xs h-7">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="border border-[#2d3352] rounded-lg p-3 space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description"
                    className={inputCls}
                  />
                  <Input
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    type="number"
                    min="0"
                    className={inputCls}
                  />
                  <Input
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                  />
                  <Button
                    type="button" variant="ghost" size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                    onClick={() => removeLineItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-end pt-1 border-t border-[#2d3352]">
                <span className="text-[#FF6B00] font-semibold text-sm">
                  Total: JMD {total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Special Notes</Label>
            <Textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Any additional notes..."
              className={`${inputCls} min-h-[72px]`}
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button" variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#2d3352] text-white hover:bg-[#1e2235]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] hover:from-[#FF6B00]/90 hover:to-[#FF8C00]/90 text-white font-semibold px-8"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
              ) : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
