'use client'

import { useEffect, useMemo, useRef, useState, forwardRef, type MutableRefObject } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import { QuickAddTechnicianDialog } from '@/components/shared/quick-add-technician-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ChevronDown, Loader2, Minus, Plus, Save } from 'lucide-react'

const Combobox = forwardRef<HTMLInputElement, {
  value: string
  onChange: (value: string) => void
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
    else (fwdRef as MutableRefObject<HTMLInputElement | null>).current = inputRef.current
  }, [fwdRef])

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (
        dropRef.current &&
        !dropRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 2, left: rect.left + window.scrollX, width: rect.width })
    }
  }, [open, options.length])

  const filtered = query.trim() === '' ? options : options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))

  const dropdown = open && (
    filtered.length > 0 ? (
      <div
        ref={dropRef}
        style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
        className="max-h-52 overflow-y-auto rounded-md border border-[#2d3352] bg-[#13172a] shadow-2xl pointer-events-auto"
      >
        {filtered.map((option) => (
          <button
            key={option}
            type="button"
            className="w-full truncate px-3 py-2 text-left text-sm text-white transition-colors hover:bg-[#00BFFF]/15"
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onChange(option)
              setQuery(option)
              setOpen(false)
            }}
          >
            {option}
          </button>
        ))}
      </div>
    ) : (
      <div
        ref={dropRef}
        style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
        className="rounded-md border border-[#2d3352] bg-[#13172a] p-3 text-sm text-gray-400 shadow-2xl pointer-events-auto"
      >
        {options.length === 0 ? 'Loading...' : 'No matches found'}
      </div>
    )
  )

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex">
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 rounded-r-none border-r-0 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => {
            if (!open) setQuery('')
            setOpen((current) => !current)
            inputRef.current?.focus()
          }}
          className="rounded-r-md border border-l-0 border-[#2d3352] bg-[#1e2235] px-2 text-gray-400 hover:text-white"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      {mounted && open ? <DialogPortal>{dropdown}</DialogPortal> : null}
    </div>
  )
})

interface Client {
  id: string
  contact_name: string
  company_name: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  parish?: string | null
}

interface Technician {
  id: string
  name: string
}

interface Appointment {
  id: string
  client_id: string | null
  technician_id: string | null
  title: string
  description: string | null
  status: string
  priority: string
  scheduled_date: string | null
  scheduled_time: string | null
  address: string | null
  notes: unknown
  clients: { contact_name: string | null; company_name: string | null; phone?: string | null } | null
  technicians: { name: string | null } | null
}

interface ParsedAppointmentNotes {
  contact_person?: unknown
  telephone?: unknown
  address_landmark?: unknown
  additional_technicians?: unknown
  company_name?: unknown
}

interface EditAppointmentDialogProps {
  appointment: Appointment | null
  clients: Client[]
  technicians: Technician[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function buildAddress(client: Client) {
  return [client.address, client.city, client.parish].filter(Boolean).join(', ')
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function parseNotes(notes: unknown): ParsedAppointmentNotes {
  if (!notes) return {}
  if (typeof notes === 'object' && !Array.isArray(notes)) return notes as ParsedAppointmentNotes
  if (typeof notes !== 'string') return {}

  try {
    return JSON.parse(notes) as ParsedAppointmentNotes
  } catch {
    return {}
  }
}

export function EditAppointmentDialog({
  appointment,
  clients,
  technicians,
  open,
  onOpenChange,
}: EditAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [availableClients, setAvailableClients] = useState<Client[]>(clients)
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>(technicians)
  const [quickAddClientOpen, setQuickAddClientOpen] = useState(false)
  const [quickAddTechnicianOpen, setQuickAddTechnicianOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [priority, setPriority] = useState('medium')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [telephone, setTelephone] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [additionalTechnicians, setAdditionalTechnicians] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const companyNames = useMemo(
    () => [...new Set(availableClients.map((client) => String(client.company_name || client.contact_name || '')).filter(Boolean))],
    [availableClients]
  )
  const addressOptions = useMemo(
    () => [...new Set(availableClients.map((client) => buildAddress(client)).filter(Boolean))],
    [availableClients]
  )
  const technicianNames = useMemo(() => availableTechnicians.map((technician) => technician.name), [availableTechnicians])
  const contactOptions = useMemo(() => {
    if (!selectedCompany) {
      return [...new Set(availableClients.map((client) => client.contact_name).filter(Boolean))]
    }

    return [
      ...new Set(
        availableClients
          .filter((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
          .map((client) => client.contact_name)
          .filter(Boolean)
      ),
    ]
  }, [availableClients, selectedCompany])

  useEffect(() => {
    if (!open) return
    setAvailableClients(clients)
  }, [clients, open])

  useEffect(() => {
    if (!open) return
    setAvailableTechnicians(technicians)
  }, [open, technicians])

  useEffect(() => {
    if (!appointment || !open) return

    const parsedNotes = parseNotes(appointment.notes)
    const company = appointment.clients?.company_name || appointment.clients?.contact_name || asText(parsedNotes.company_name)
    const matchingClient = clients.find(
      (client) =>
        client.id === appointment.client_id ||
        client.company_name === company ||
        client.contact_name === company
    )

    setSubject(appointment.title || '')
    setAppointmentDate(appointment.scheduled_date || '')
    setAppointmentTime(appointment.scheduled_time || '')
    setStatus(appointment.status || 'scheduled')
    setPriority(appointment.priority || 'medium')
    setSelectedCompany(company || '')
    setContactPerson(asText(parsedNotes.contact_person) || appointment.clients?.contact_name || '')
    setTelephone(asText(parsedNotes.telephone) || matchingClient?.phone || '')
    setSelectedTechnician(appointment.technicians?.name || '')
    setAdditionalTechnicians(
      Array.isArray(parsedNotes.additional_technicians)
        ? parsedNotes.additional_technicians.map((entry) => asText(entry)).filter(Boolean).join(', ')
        : ''
    )
    setAddress(appointment.address || '')
    setLandmark(asText(parsedNotes.address_landmark))
    setNotes(appointment.description || '')
  }, [appointment, clients, open])

  function handleCompanySelect(company: string) {
    setSelectedCompany(company)
    const matchingClients = availableClients.filter((client) => client.company_name === company || client.contact_name === company)
    if (matchingClients.length === 0) return

    const [firstClient] = matchingClients
    setContactPerson(firstClient.contact_name || '')
    setTelephone(firstClient.phone || '')
    const clientAddress = buildAddress(firstClient)
    if (clientAddress) setAddress(clientAddress)
  }

  function handleQuickAddClientSuccess(newClient: Client) {
    setAvailableClients((current) => [...current, newClient])

    const newName = newClient.company_name || newClient.contact_name || ''
    const clientAddress = buildAddress(newClient)

    setSelectedCompany(newName)
    setContactPerson(newClient.contact_name || '')
    setTelephone(newClient.phone || '')
    if (clientAddress) setAddress(clientAddress)
  }

  function handleQuickAddTechnicianSuccess(newTechnician: Technician) {
    setAvailableTechnicians((current) => [...current, newTechnician])
    setSelectedTechnician(newTechnician.name || '')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!appointment) return

    if (!subject.trim()) {
      toast.error('Appointment subject is required')
      return
    }

    if (!appointmentDate) {
      toast.error('Appointment date is required')
      return
    }

    setLoading(true)

    const clientRecord = availableClients.find((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
    const technicianRecord = availableTechnicians.find((technician) => technician.name === selectedTechnician)
    const additionalTechnicianList = additionalTechnicians
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('jobs')
      .update({
        title: subject.trim(),
        description: notes.trim() || null,
        status,
        priority,
        scheduled_date: appointmentDate,
        scheduled_time: appointmentTime || null,
        address: address.trim() || null,
        client_id: clientRecord?.id || null,
        technician_id: technicianRecord?.id || null,
        notes: JSON.stringify({
          appointment: true,
          recurring_schedule: 'one-time',
          is_service_contract: false,
          contact_person: contactPerson.trim(),
          telephone: telephone.trim(),
          address_landmark: landmark.trim(),
          additional_technicians: additionalTechnicianList,
          company_name: selectedCompany.trim(),
        }),
      })
      .eq('id', appointment.id)

    if (error) {
      console.error('[EditAppointmentDialog] Failed to update appointment', error)
      toast.error(error.message || 'Failed to update appointment')
      setLoading(false)
      return
    }

    toast.success('Appointment updated successfully')
    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  const labelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400'
  const sectionClassName = 'space-y-3 rounded-xl border border-[#2d3352] bg-[#151a2c] p-4'

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-[#2d3352] bg-[#0d1220] p-0 text-white">
        <div className="rounded-t-lg bg-gradient-to-r from-[#0f7d8a] via-[#154c79] to-[#1d365f] px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Edit Appointment</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-4">
            <div className={sectionClassName}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Appointment Details</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Date</Label>
                  <Input type="date" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className="border-[#2d3352] bg-[#1e2235] text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Time</Label>
                  <Input type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} className="border-[#2d3352] bg-[#1e2235] text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Subject</Label>
                <div className="flex items-center gap-1">
                  <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Appointment subject" className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500" />
                  <button type="button" onClick={() => setSubject('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-[#2d3352] bg-[#1e2235] text-white">
                    <SelectValue />
                  </SelectTrigger>
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
                <Label className={labelClassName}>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="border-[#2d3352] bg-[#1e2235] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#2d3352] bg-[#13172a] text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={sectionClassName}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">Client Information</p>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Company / Client</Label>
                <div className="flex items-center gap-1">
                  <Combobox value={selectedCompany} onChange={handleCompanySelect} options={companyNames} placeholder="Select company..." />
                  <button
                    type="button"
                    onClick={() => setQuickAddClientOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00BCD4] text-white hover:bg-[#00BCD4]/80"
                    title="Add new client"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setSelectedCompany('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Contact Person</Label>
                  <div className="flex items-center gap-1">
                    <Combobox value={contactPerson} onChange={setContactPerson} options={contactOptions} placeholder="Contact person" />
                    <button type="button" onClick={() => setContactPerson('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Telephone</Label>
                  <div className="flex items-center gap-1">
                    <Input value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="Telephone number" className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500" />
                    <button type="button" onClick={() => setTelephone('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">Technician Assignment</p>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Technician Assigned</Label>
                <div className="flex items-center gap-1">
                  <Combobox value={selectedTechnician} onChange={setSelectedTechnician} options={technicianNames} placeholder="Select technician..." />
                  <button
                    type="button"
                    onClick={() => setQuickAddTechnicianOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00BCD4] text-white hover:bg-[#00BCD4]/80"
                    title="Add new technician"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setSelectedTechnician('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Additional Technicians</Label>
                <div className="flex items-center gap-1">
                  <Input value={additionalTechnicians} onChange={(event) => setAdditionalTechnicians(event.target.value)} placeholder="Comma separated technician names" className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500" />
                  <button type="button" onClick={() => setAdditionalTechnicians('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400">Location</p>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Address</Label>
                <div className="flex items-center gap-1">
                  <Combobox value={address} onChange={setAddress} options={addressOptions} placeholder="Type or select address" />
                  <button type="button" onClick={() => setAddress('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Address Landmark</Label>
                <div className="flex items-center gap-1">
                  <Input value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Nearby landmark" className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500" />
                  <button type="button" onClick={() => setLandmark('')} className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={sectionClassName}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-300">Notes</p>
            </div>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Additional appointment notes..." className="min-h-[120px] border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2d3352] bg-transparent text-white hover:bg-[#1e2235]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 text-black hover:bg-emerald-400">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>

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
    </Dialog>
  )
}
