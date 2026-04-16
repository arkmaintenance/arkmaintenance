'use client'

import { useEffect, useState, useRef, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Minus, Loader2, Trash2, ChevronDown, MessageCircle } from 'lucide-react'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import { QuickAddTechnicianDialog } from '@/components/shared/quick-add-technician-dialog'
import { buildJobWhatsAppUrl } from '@/lib/job-whatsapp'
import {
  closePendingExternalWindow,
  openPendingExternalWindow,
  redirectPendingExternalWindow,
} from '@/lib/pending-external-window'

// ─── Inline Combobox (portal-based) ──────────────────────────────────────────

const Combobox = forwardRef<HTMLInputElement, {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}>(function Combobox({ value, onChange, options, placeholder }, fwdRef) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState(value)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (!fwdRef) return
    if (typeof fwdRef === 'function') fwdRef(inputRef.current)
    else if (fwdRef) fwdRef.current = inputRef.current
  })

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 2, left: r.left + window.scrollX, width: r.width })
    }
  }, [open, options.length])

  const filtered = query.trim() === '' ? options : options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  const dropdown = open && (filtered.length > 0 ? (
    <div ref={dropRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
      className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-2xl max-h-52 overflow-y-auto pointer-events-auto">
      {filtered.map((opt, i) => (
        <button key={i} type="button"
          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#FF6B00]/20 truncate"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(opt); setQuery(opt); setOpen(false) }}>
          {opt}
        </button>
      ))}
    </div>
  ) : (
    <div ref={dropRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
      className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-2xl p-3 text-gray-400 text-sm pointer-events-auto">
      {options.length === 0 ? 'Loading...' : 'No matches found'}
    </div>
  ))

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex">
        <Input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-[#1e2235] border-[#2d3352] text-white rounded-r-none border-r-0 flex-1 placeholder:text-gray-500" />
        <button type="button"
          onClick={() => { if (!open) setQuery(''); setOpen(o => !o); inputRef.current?.focus() }}
          className="px-2 bg-[#1e2235] border border-[#2d3352] border-l-0 rounded-r-md text-gray-400 hover:text-white">
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      {mounted && open && <DialogPortal>{dropdown}</DialogPortal>}
    </div>
  )
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client { id: string; contact_name: string; company_name: string | null; phone?: string | null; address?: string; city?: string; parish?: string }
interface Technician { id: string; name: string }
interface ServiceOption { name: string; base_price: number }
interface LineItem { id: string; description: string; quantity: number; unit_price: number }
interface AddJobDialogProps { clients: Client[]; technicians: Technician[] }

// ─── Component ────────────────────────────────────────────────────────────────

export function AddJobDialog({ clients: initialClients, technicians: initialTechnicians }: AddJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // DB-loaded options
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians)
  const [companyNames, setCompanyNames] = useState<string[]>([])
  const [contactNames, setContactNames] = useState<string[]>([])
  const [addresses, setAddresses] = useState<string[]>([])
  const [technicianNames, setTechnicianNames] = useState<string[]>([])
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [serviceNames, setServiceNames] = useState<string[]>([])

  const [locations] = useState(['Kingston', 'St. Andrew', 'St. Catherine', 'Portmore', 'Montego Bay', 'Ocho Rios', 'Mandeville'])

  // Form state
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
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
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddTechnicianOpen, setQuickAddTechnicianOpen] = useState(false)

  // Load clients + services from DB when dialog opens
  useEffect(() => {
    if (!open) return
    console.log('[v0] AddJobDialog opened, loading data...')
    async function load() {
      const { data: clientData, error: clientError } = await supabase.from('clients').select('id, contact_name, company_name, phone, address, city, parish').order('company_name')
      console.log('[v0] Clients loaded:', clientData?.length, 'error:', clientError)
      if (clientData) {
        const safeClients = clientData as Client[]
        setClients(safeClients)
        setCompanyNames([...new Set(safeClients.map((client) => client.company_name).filter(Boolean) as string[])])
        setContactNames([...new Set(safeClients.map((client) => client.contact_name).filter(Boolean))])
        setAddresses([...new Set(safeClients.map((client) => [client.address, client.city, client.parish].filter(Boolean).join(', ')).filter(Boolean))])
      }
      const { data: techData } = await supabase.from('technicians').select('id, name').order('name')
      if (techData) {
        const safeTechnicians = techData as Technician[]
        setTechnicians(safeTechnicians)
        setTechnicianNames(safeTechnicians.map((technician) => technician.name))
      }
      const { data: svcData } = await supabase.from('services').select('name, base_price').eq('status', 'active').order('name')
      if (svcData) {
        const safeServices = svcData as ServiceOption[]
        setServiceOptions(safeServices.map((service) => ({ name: service.name, base_price: Number(service.base_price) })))
        setServiceNames(safeServices.map((service) => service.name))
      }

    }
    load()
  }, [open])

  // Auto-fill contact/address when company is selected
  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company)
    const match = clients.find(c => c.company_name === company || c.contact_name === company)
    if (match) {
      if (match.contact_name && !contactPerson) setContactPerson(match.contact_name)
      setWhatsappNumber(match.phone || '')
      const addr = [match.address, match.city, match.parish].filter(Boolean).join(', ')
      if (addr) setClientAddress(addr)
      setContactNames(clients.filter(c => c.company_name === company || c.contact_name === company).map(c => c.contact_name).filter(Boolean))
    }
  }

  const handleQuickAddSuccess = (newClient: any) => {
    setClients(prev => [...prev, newClient])
    const newName = newClient.company_name || newClient.contact_name || ''
    setCompanyNames(prev => [...new Set([...prev, newName])])
    setContactNames(prev => [...new Set([...prev, newClient.contact_name || ''])])
    const newAddr = [newClient.address, newClient.city, newClient.parish].filter(Boolean).join(', ')
    setAddresses(prev => [...new Set([...prev, newAddr])])

    setSelectedCompany(newName)
    setContactPerson(newClient.contact_name || '')
    setWhatsappNumber(newClient.phone || '')
    setClientAddress(newAddr)
    if (newClient.parish) setLocation(newClient.parish)
  }

  const handleTechnicianSelect = (name: string) => {
    setSelectedTechnician(name)
  }

  const handleQuickAddTechnicianSuccess = (newTechnician: Technician) => {
    setTechnicians(prev => [...prev, newTechnician])
    setTechnicianNames(prev => [...new Set([...prev, newTechnician.name].filter(Boolean))])
    setSelectedTechnician(newTechnician.name || '')
  }

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const addLineItem = () => setLineItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 }])
  const removeLineItem = (id: string) => { if (lineItems.length > 1) setLineItems(prev => prev.filter(i => i.id !== id)) }
  
  const selectService = (id: string, name: string) => {
    const svc = serviceOptions.find(s => s.name === name)
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      return { ...item, description: name, unit_price: svc?.base_price ?? item.unit_price }
    }))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  async function submitJob(options: { shareToWhatsApp: boolean }) {
    if (!jobTitle.trim()) { toast.error('Job title is required'); return }

    const clientRecord = clients.find(c => c.company_name === selectedCompany || c.contact_name === selectedCompany)
    const techRecord = technicians.find(t => t.name === selectedTechnician)
    const whatsappUrl = options.shareToWhatsApp ? buildJobWhatsAppUrl({
      phone: whatsappNumber || clientRecord?.phone,
      title: jobTitle,
      clientName: clientRecord?.company_name || clientRecord?.contact_name || selectedCompany,
      contactPerson: contactPerson || clientRecord?.contact_name,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || null,
      address: clientAddress || null,
      technicianName: techRecord?.name || selectedTechnician,
      status,
      description: specialNotes || null,
      lineItems,
    }) : null

    if (options.shareToWhatsApp && !whatsappUrl) {
      toast.error('Select a client with a phone number before sharing to WhatsApp')
      return
    }

    const pendingWindow = whatsappUrl ? openPendingExternalWindow('Opening WhatsApp') : null
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      closePendingExternalWindow(pendingWindow)
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

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
      client_id: clientRecord?.id || null,
      technician_id: techRecord?.id || null,
      is_recurring: recurringSchedule !== 'one-time',
      notes: JSON.stringify({
        contact_person: contactPerson,
        whatsapp_number: whatsappNumber.trim(),
        location,
        department,
        supplier,
        materials,
        tech_charge: techCharge,
        line_items: lineItems,
        recurring_schedule: recurringSchedule,
        is_service_contract: isServiceContract,
      }),
    })

    if (error) {
      closePendingExternalWindow(pendingWindow)
      console.error('[AddJobDialog] Failed to create job', error)
      toast.error(error.message || 'Failed to create job')
      setLoading(false)
      return
    }

    if (whatsappUrl) {
      redirectPendingExternalWindow(pendingWindow, whatsappUrl)
    }

    toast.success(whatsappUrl ? 'Job created and opened in WhatsApp' : 'Job created successfully')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void submitJob({ shareToWhatsApp: false })
  }

  const labelCls = 'text-gray-400 text-xs uppercase tracking-wide font-medium'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" /> New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#13172a] border-[#2d3352] max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
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
            <div className="flex gap-1 items-center">
              <Input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Type job title..."
                className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500"
              />
              <button type="button" onClick={() => setJobTitle('')}
                className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Company + Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Company / Client</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={selectedCompany} onChange={handleCompanySelect} options={companyNames} placeholder="Select company..." />
                <button type="button" onClick={() => setQuickAddOpen(true)}
                  className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0"
                  title="Add New Client">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => { setSelectedCompany(''); setContactPerson(''); setWhatsappNumber(''); setClientAddress('') }}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Contact Person</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={contactPerson} onChange={setContactPerson} options={contactNames} placeholder="Select or type contact..." />
                <button type="button" onClick={() => setContactPerson('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: WhatsApp Number + Client Address */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>WhatsApp Number</Label>
              <div className="flex gap-1 items-center">
                <Input
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="Client WhatsApp number"
                  className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500"
                />
                <button type="button" onClick={() => setWhatsappNumber('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Client Address</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={clientAddress} onChange={setClientAddress} options={addresses} placeholder="Select or type address..." />
                <button type="button" onClick={() => setClientAddress('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Technician + Tech Charge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Technician</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={selectedTechnician} onChange={handleTechnicianSelect} options={technicianNames} placeholder="Select technician..." />
                <button type="button" onClick={() => setQuickAddTechnicianOpen(true)}
                  className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setSelectedTechnician('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Tech Charge (JMD)</Label>
              <div className="flex gap-1 items-center">
                <Input value={techCharge} onChange={e => setTechCharge(e.target.value)} placeholder="0.00" type="number" min="0" step="0.01"
                  className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500" />
                <button type="button" onClick={() => setTechCharge('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 5: Location + Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Location</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={location} onChange={setLocation} options={locations} placeholder="Select location..." />
                <button type="button" onClick={() => setLocation('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Department</Label>
              <div className="flex gap-1 items-center">
                <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department (optional)"
                  className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500" />
                <button type="button" onClick={() => setDepartment('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 6: Supplier & Materials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Supplier</Label>
              <div className="flex gap-1 items-center">
                <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name"
                  className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500" />
                <button type="button" onClick={() => setSupplier('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Materials</Label>
              <div className="flex gap-1 items-center">
                <Input value={materials} onChange={e => setMaterials(e.target.value)} placeholder="Parts / materials used"
                  className="bg-[#1e2235] border-[#2d3352] text-white flex-1 placeholder:text-gray-500" />
                <button type="button" onClick={() => setMaterials('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 7: Job Type + Priority + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="bg-[#1e2235] border-[#2d3352] text-white"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="bg-[#1e2235] border-[#2d3352] text-white"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="bg-[#1e2235] border-[#2d3352] text-white"><SelectValue /></SelectTrigger>
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
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                className="bg-[#1e2235] border-[#2d3352] text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Scheduled Time</Label>
              <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                className="bg-[#1e2235] border-[#2d3352] text-white" />
            </div>
          </div>

          {/* Row 9: Recurring + Service Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Recurring Schedule</Label>
              <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
                <SelectTrigger className="bg-[#1e2235] border-[#2d3352] text-white"><SelectValue /></SelectTrigger>
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
              <Switch checked={isServiceContract} onCheckedChange={setIsServiceContract} className="data-[state=checked]:bg-[#00BFFF]" />
              <Label className="text-gray-300 text-sm">Service Contract</Label>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={labelCls}>Service Description / Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addLineItem} className="text-[#00BFFF] text-xs h-7">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>
            <div className="border border-[#2d3352] rounded-lg p-3 space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center">
                  <Combobox value={item.description} onChange={v => selectService(item.id, v)} options={serviceNames} placeholder="Select or type service..." />
                  <Input value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Qty" type="number" min="0" className="bg-[#1e2235] border-[#2d3352] text-white" />
                  <Input value={item.unit_price} onChange={e => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="Price" type="number" min="0" step="0.01" className="bg-[#1e2235] border-[#2d3352] text-white" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500" onClick={() => removeLineItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-end pt-1 border-t border-[#2d3352]">
                <span className="text-[#FF6B00] font-semibold text-sm">Total: JMD {total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Special Notes</Label>
            <Textarea value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} placeholder="Any additional notes..."
              className="bg-[#1e2235] border-[#2d3352] text-white min-h-[72px] placeholder:text-gray-500" rows={3} />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[#2d3352] text-white hover:bg-[#1e2235]">Cancel</Button>
            <Button type="button" disabled={loading} onClick={() => void submitJob({ shareToWhatsApp: true })} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><MessageCircle className="mr-2 h-4 w-4" />Share to WhatsApp</>}
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] hover:from-[#FF6B00]/90 hover:to-[#FF8C00]/90 text-white font-semibold px-8">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <QuickAddClientDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />

      <QuickAddTechnicianDialog
        open={quickAddTechnicianOpen}
        onOpenChange={setQuickAddTechnicianOpen}
        onSuccess={handleQuickAddTechnicianSuccess}
      />
    </Dialog>
  )
}
