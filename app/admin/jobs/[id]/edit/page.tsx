'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, MessageCircle, Minus, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import { QuickAddTechnicianDialog } from '@/components/shared/quick-add-technician-dialog'
import { createClient } from '@/lib/supabase/client'
import { buildJobWhatsAppUrl } from '@/lib/job-whatsapp'
import {
  closePendingExternalWindow,
  openPendingExternalWindow,
  redirectPendingExternalWindow,
} from '@/lib/pending-external-window'

interface ClientOption {
  id: string
  contact_name: string | null
  company_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  parish: string | null
}

interface TechnicianOption {
  id: string
  name: string
}

interface ServiceOption {
  name: string
  base_price: number
}

interface JobRecord {
  id: string
  title: string
  description: string | null
  job_type: string
  status: string
  priority: string
  scheduled_date: string | null
  scheduled_time: string | null
  address: string | null
  notes: unknown
  is_recurring: boolean | null
  clients: {
    contact_name: string | null
    company_name: string | null
    phone: string | null
    address: string | null
    city: string | null
    parish: string | null
  } | null
  technicians: {
    name: string | null
  } | null
}

interface ParsedJobNotes {
  contact_person?: unknown
  whatsapp_number?: unknown
  location?: unknown
  department?: unknown
  supplier?: unknown
  materials?: unknown
  tech_charge?: unknown
  line_items?: unknown
  recurring_schedule?: unknown
  is_service_contract?: unknown
  company_name?: unknown
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function parseNotes(notes: unknown): ParsedJobNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedJobNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedJobNotes
  } catch {
    return {}
  }
}

function normalizeLineItems(value: unknown): LineItem[] {
  if (!Array.isArray(value)) {
    return [{ id: '1', description: '', quantity: 1, unit_price: 0 }]
  }

  const items = value
    .map((item, index) => {
      const record = item as Record<string, unknown>
      const quantity = Number(record.quantity ?? record.qty ?? 1)
      const unitPrice = Number(record.unit_price ?? record.unitPrice ?? 0)

      return {
        id: `${index + 1}`,
        description: asText(record.description),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
      }
    })
    .filter((item) => item.description || item.quantity || item.unit_price)

  return items.length > 0 ? items : [{ id: '1', description: '', quantity: 1, unit_price: 0 }]
}

function buildAddress(client: ClientOption | JobRecord['clients']) {
  return [client?.address, client?.city, client?.parish].filter(Boolean).join(', ')
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([])
  const [quickAddClientOpen, setQuickAddClientOpen] = useState(false)
  const [quickAddTechnicianOpen, setQuickAddTechnicianOpen] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [techCharge, setTechCharge] = useState('')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [supplier, setSupplier] = useState('')
  const [materials, setMaterials] = useState('')
  const [jobType, setJobType] = useState('repair')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('scheduled')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [recurringSchedule, setRecurringSchedule] = useState('one-time')
  const [isServiceContract, setIsServiceContract] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: '1', description: '', quantity: 1, unit_price: 0 }])
  const [specialNotes, setSpecialNotes] = useState('')

  const companyOptions = useMemo(
    () => [...new Set(clients.map((client) => String(client.company_name || client.contact_name || '')).filter(Boolean))],
    [clients]
  )
  const contactOptions = useMemo(() => {
    if (!selectedCompany) {
      return [...new Set(clients.map((client) => asText(client.contact_name)).filter(Boolean))]
    }

    return [
      ...new Set(
        clients
          .filter((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
          .map((client) => asText(client.contact_name))
          .filter(Boolean)
      ),
    ]
  }, [clients, selectedCompany])
  const addressOptions = useMemo(
    () => [...new Set(clients.map((client) => buildAddress(client)).filter(Boolean))],
    [clients]
  )
  const technicianOptions = useMemo(() => technicians.map((technician) => technician.name), [technicians])
  const serviceNames = useMemo(() => serviceOptions.map((service) => service.name), [serviceOptions])
  const total = useMemo(() => lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0), [lineItems])

  useEffect(() => {
    if (!jobId) {
      toast.error('Invalid job')
      router.push('/admin/jobs')
      return
    }

    async function load() {
      const [
        { data: jobData, error: jobError },
        { data: clientsData },
        { data: techniciansData },
        { data: servicesData },
      ] = await Promise.all([
        supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            job_type,
            status,
            priority,
            scheduled_date,
            scheduled_time,
            address,
            notes,
            is_recurring,
            clients (
              contact_name,
              company_name,
              phone,
              address,
              city,
              parish
            ),
            technicians (
              name
            )
          `)
          .eq('id', jobId)
          .single(),
        supabase.from('clients').select('id, contact_name, company_name, phone, address, city, parish').order('company_name'),
        supabase.from('technicians').select('id, name').order('name'),
        supabase.from('services').select('name, base_price').eq('status', 'active').order('name'),
      ])

      if (jobError || !jobData) {
        toast.error('Failed to load job')
        router.push('/admin/jobs')
        return
      }

      const record = jobData as unknown as JobRecord
      if (record.job_type === 'appointment') {
        toast.error('Appointments are edited from the appointments screen')
        router.push(`/admin/jobs/${jobId}`)
        return
      }

      const parsedNotes = parseNotes(record.notes)
      setClients((clientsData || []) as ClientOption[])
      setTechnicians((techniciansData || []) as TechnicianOption[])
      setServiceOptions(
        ((servicesData || []) as Array<{ name: string; base_price: number | string }>).map((service) => ({
          name: service.name,
          base_price: Number(service.base_price || 0),
        }))
      )

      setJobTitle(record.title || '')
      setSelectedCompany(record.clients?.company_name || record.clients?.contact_name || asText(parsedNotes.company_name))
      setContactPerson(asText(parsedNotes.contact_person) || record.clients?.contact_name || '')
      setWhatsappNumber(asText(parsedNotes.whatsapp_number) || record.clients?.phone || '')
      setClientAddress(record.address || buildAddress(record.clients))
      setSelectedTechnician(record.technicians?.name || '')
      setTechCharge(asText(parsedNotes.tech_charge))
      setLocation(asText(parsedNotes.location) || record.clients?.parish || '')
      setDepartment(asText(parsedNotes.department))
      setSupplier(asText(parsedNotes.supplier))
      setMaterials(asText(parsedNotes.materials))
      setJobType(record.job_type || 'repair')
      setPriority(record.priority || 'medium')
      setStatus(record.status || 'scheduled')
      setScheduledDate(record.scheduled_date || '')
      setScheduledTime(record.scheduled_time || '')
      setRecurringSchedule(asText(parsedNotes.recurring_schedule) || (record.is_recurring ? 'monthly' : 'one-time'))
      setIsServiceContract(parsedNotes.is_service_contract === true)
      setLineItems(normalizeLineItems(parsedNotes.line_items))
      setSpecialNotes(record.description || '')
      setLoading(false)
    }

    void load()
  }, [jobId, router, supabase])

  function handleCompanyChange(value: string) {
    setSelectedCompany(value)
    const matches = clients.filter((client) => client.company_name === value || client.contact_name === value)
    if (matches.length === 0) return

    const [firstMatch] = matches
    if (firstMatch.contact_name) setContactPerson(firstMatch.contact_name)
    setWhatsappNumber(firstMatch.phone || '')
    const nextAddress = buildAddress(firstMatch)
    if (nextAddress) setClientAddress(nextAddress)
    if (firstMatch.parish) setLocation(firstMatch.parish)
  }

  function handleQuickAddClientSuccess(newClient: ClientOption) {
    setClients((current) => [...current, newClient])
    const newName = newClient.company_name || newClient.contact_name || ''
    const nextAddress = buildAddress(newClient)

    setSelectedCompany(newName)
    setContactPerson(newClient.contact_name || '')
    setWhatsappNumber(newClient.phone || '')
    setClientAddress(nextAddress)
    if (newClient.parish) setLocation(newClient.parish)
  }

  function handleQuickAddTechnicianSuccess(newTechnician: TechnicianOption) {
    setTechnicians((current) => [...current, newTechnician])
    setSelectedTechnician(newTechnician.name || '')
  }

  function addLineItem() {
    setLineItems((current) => [...current, { id: `${Date.now()}-${current.length + 1}`, description: '', quantity: 1, unit_price: 0 }])
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((current) => current.map((item) => {
      if (item.id !== id) return item
      if (field === 'description') {
        const service = serviceOptions.find((option) => option.name === value)
        return { ...item, description: String(value), unit_price: service ? service.base_price : item.unit_price }
      }

      return { ...item, [field]: value }
    }))
  }

  async function submitJob(options: { shareToWhatsApp: boolean }) {
    if (!jobId) return

    if (!jobTitle.trim()) {
      toast.error('Job title is required')
      return
    }

    const clientRecord = clients.find((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
    const technicianRecord = technicians.find((technician) => technician.name === selectedTechnician)
    const whatsappUrl = options.shareToWhatsApp ? buildJobWhatsAppUrl({
      phone: whatsappNumber || clientRecord?.phone,
      title: jobTitle,
      clientName: clientRecord?.company_name || clientRecord?.contact_name || selectedCompany,
      contactPerson: contactPerson || clientRecord?.contact_name,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || null,
      address: clientAddress || null,
      technicianName: technicianRecord?.name || selectedTechnician,
      status,
      description: specialNotes || null,
      lineItems,
    }) : null

    if (options.shareToWhatsApp && !whatsappUrl) {
      toast.error('Select a client with a phone number before sending to WhatsApp')
      return
    }

    const pendingWindow = whatsappUrl ? openPendingExternalWindow('Opening WhatsApp') : null
    setSaving(true)

    const { error } = await supabase
      .from('jobs')
      .update({
        title: jobTitle.trim(),
        description: specialNotes.trim() || null,
        job_type: jobType,
        status,
        priority,
        scheduled_date: scheduledDate || null,
        scheduled_time: scheduledTime || null,
        address: clientAddress.trim() || null,
        client_id: clientRecord?.id || null,
        technician_id: technicianRecord?.id || null,
        is_recurring: recurringSchedule !== 'one-time',
        notes: JSON.stringify({
          company_name: selectedCompany.trim(),
          contact_person: contactPerson.trim(),
          whatsapp_number: whatsappNumber.trim(),
          location: location.trim(),
          department: department.trim(),
          supplier: supplier.trim(),
          materials: materials.trim(),
          tech_charge: techCharge.trim(),
          line_items: lineItems.map((item) => ({
            description: item.description.trim(),
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          recurring_schedule: recurringSchedule,
          is_service_contract: isServiceContract,
        }),
      })
      .eq('id', jobId)

    if (error) {
      closePendingExternalWindow(pendingWindow)
      toast.error(error.message || 'Failed to update job')
      setSaving(false)
      return
    }

    if (whatsappUrl) {
      redirectPendingExternalWindow(pendingWindow, whatsappUrl)
    }

    toast.success(whatsappUrl ? 'Job updated and opened in WhatsApp' : 'Job updated successfully')
    setSaving(false)
    router.push(`/admin/jobs/${jobId}`)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    void submitJob({ shareToWhatsApp: false })
  }

  const labelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400'
  const inputClassName = 'border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500'
  const sectionClassName = 'rounded-xl border border-[#2d3352] bg-[#151a2c] p-5'

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00BFFF]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Edit Job" />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button asChild variant="outline" className="border-border">
              <Link href={`/admin/jobs/${jobId}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to Job
              </Link>
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Update Job</h2>
              <p className="text-sm text-muted-foreground">Edit the job details and save the changes.</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estimated Total</p>
            <p className="text-2xl font-semibold text-[#FF6B00]">JMD {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Core job information, scheduling, and assignment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={sectionClassName}>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5 lg:col-span-2">
                    <Label className={labelClassName}>Job Title *</Label>
                    <div className="flex items-center gap-2">
                      <Input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} className={inputClassName} placeholder="Job title" />
                      <button type="button" onClick={() => setJobTitle('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Company / Client</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedCompany}
                        onChange={(event) => handleCompanyChange(event.target.value)}
                        className={inputClassName}
                        placeholder="Select or type company"
                        list="job-client-options"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickAddClientOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-[#00BCD4] text-white hover:bg-[#00BCD4]/80"
                        title="Add new client"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => { setSelectedCompany(''); setContactPerson(''); setWhatsappNumber(''); setClientAddress('') }} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <datalist id="job-client-options">
                      {companyOptions.map((option) => <option key={option} value={option} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Contact Person</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={contactPerson}
                        onChange={(event) => setContactPerson(event.target.value)}
                        className={inputClassName}
                        placeholder="Contact person"
                        list="job-contact-options"
                      />
                      <button type="button" onClick={() => setContactPerson('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <datalist id="job-contact-options">
                      {contactOptions.map((option) => <option key={option} value={option} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5 lg:col-span-2">
                    <Label className={labelClassName}>WhatsApp Number</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={whatsappNumber}
                        onChange={(event) => setWhatsappNumber(event.target.value)}
                        className={inputClassName}
                        placeholder="Client WhatsApp number"
                      />
                      <button type="button" onClick={() => setWhatsappNumber('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:col-span-2">
                    <Label className={labelClassName}>Client Address</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={clientAddress}
                        onChange={(event) => setClientAddress(event.target.value)}
                        className={inputClassName}
                        placeholder="Client address"
                        list="job-address-options"
                      />
                      <button type="button" onClick={() => setClientAddress('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <datalist id="job-address-options">
                      {addressOptions.map((option) => <option key={option} value={option} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Technician</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedTechnician}
                        onChange={(event) => setSelectedTechnician(event.target.value)}
                        className={inputClassName}
                        placeholder="Assigned technician"
                        list="job-technician-options"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickAddTechnicianOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-[#00BCD4] text-white hover:bg-[#00BCD4]/80"
                        title="Add new technician"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setSelectedTechnician('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <datalist id="job-technician-options">
                      {technicianOptions.map((option) => <option key={option} value={option} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Tech Charge (JMD)</Label>
                    <div className="flex items-center gap-2">
                      <Input value={techCharge} onChange={(event) => setTechCharge(event.target.value)} className={inputClassName} placeholder="0.00" type="number" min="0" step="0.01" />
                      <button type="button" onClick={() => setTechCharge('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Location</Label>
                    <div className="flex items-center gap-2">
                      <Input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClassName} placeholder="Location" />
                      <button type="button" onClick={() => setLocation('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Department</Label>
                    <div className="flex items-center gap-2">
                      <Input value={department} onChange={(event) => setDepartment(event.target.value)} className={inputClassName} placeholder="Department" />
                      <button type="button" onClick={() => setDepartment('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Supplier</Label>
                    <div className="flex items-center gap-2">
                      <Input value={supplier} onChange={(event) => setSupplier(event.target.value)} className={inputClassName} placeholder="Supplier" />
                      <button type="button" onClick={() => setSupplier('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Materials</Label>
                    <div className="flex items-center gap-2">
                      <Input value={materials} onChange={(event) => setMaterials(event.target.value)} className={inputClassName} placeholder="Materials" />
                      <button type="button" onClick={() => setMaterials('')} className="flex h-9 w-9 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={sectionClassName}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#2d3352] bg-[#13172a] text-white">
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#2d3352] bg-[#13172a] text-white">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#2d3352] bg-[#13172a] text-white">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Scheduled Date</Label>
                    <Input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} className={inputClassName} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Scheduled Time</Label>
                    <Input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} className={inputClassName} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className={labelClassName}>Recurring Schedule</Label>
                    <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
                      <SelectTrigger className={inputClassName}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#2d3352] bg-[#13172a] text-white">
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Switch checked={isServiceContract} onCheckedChange={setIsServiceContract} className="data-[state=checked]:bg-[#00BFFF]" />
                  <Label className="text-sm text-gray-300">Service Contract</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Update the services and pricing captured on this job.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Services</p>
                <Button type="button" variant="ghost" onClick={addLineItem} className="text-[#00BFFF] hover:text-[#00BFFF]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-lg border border-[#2d3352] bg-[#151a2c] p-4 md:grid-cols-[1fr_100px_140px_44px]">
                    <div className="space-y-1.5">
                      <Label className={labelClassName}>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(event) => updateLineItem(item.id, 'description', event.target.value)}
                        className={inputClassName}
                        placeholder="Service description"
                        list={`service-options-${item.id}`}
                      />
                      <datalist id={`service-options-${item.id}`}>
                        {serviceNames.map((option) => <option key={option} value={option} />)}
                      </datalist>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={labelClassName}>Qty</Label>
                      <Input
                        value={item.quantity}
                        onChange={(event) => updateLineItem(item.id, 'quantity', Number(event.target.value) || 0)}
                        className={inputClassName}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className={labelClassName}>Unit Price</Label>
                      <Input
                        value={item.unit_price}
                        onChange={(event) => updateLineItem(item.id, 'unit_price', Number(event.target.value) || 0)}
                        className={inputClassName}
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => removeLineItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Special instructions or extra context for the job.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={specialNotes} onChange={(event) => setSpecialNotes(event.target.value)} className={`min-h-[140px] ${inputClassName}`} placeholder="Additional notes" />
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" className="border-border" onClick={() => router.push(`/admin/jobs/${jobId}`)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void submitJob({ shareToWhatsApp: true })} className="bg-emerald-600 text-white hover:bg-emerald-500">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
              Save & WhatsApp
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Job
            </Button>
          </div>
        </form>
      </div>

      <QuickAddClientDialog
        open={quickAddClientOpen}
        onOpenChange={setQuickAddClientOpen}
        onSuccess={handleQuickAddClientSuccess}
      />

      <QuickAddTechnicianDialog
        open={quickAddTechnicianOpen}
        onOpenChange={setQuickAddTechnicianOpen}
        onSuccess={handleQuickAddTechnicianSuccess}
      />
    </div>
  )
}
