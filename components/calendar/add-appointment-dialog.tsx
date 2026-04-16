'use client'

import { useEffect, useMemo, useRef, useState, forwardRef, type MutableRefObject } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'
import { QuickAddTechnicianDialog } from '@/components/shared/quick-add-technician-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CalendarPlus, ChevronDown, Loader2, Minus, Plus } from 'lucide-react'

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
  address?: string
  city?: string
  parish?: string
}

interface Technician {
  id: string
  name: string
}

interface AddAppointmentDialogProps {
  clients: Client[]
  technicians: Technician[]
}

function buildAddress(client: Client) {
  return [client.address, client.city, client.parish].filter(Boolean).join(', ')
}

export function AddAppointmentDialog({ clients: initialClients, technicians: initialTechnicians }: AddAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians)
  const [quickAddClientOpen, setQuickAddClientOpen] = useState(false)
  const [quickAddTechnicianOpen, setQuickAddTechnicianOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0])
  const [appointmentTime, setAppointmentTime] = useState('')
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
    () => [...new Set(clients.map((client) => String(client.company_name || client.contact_name || '')).filter(Boolean))],
    [clients]
  )
  const contactNames = useMemo(() => {
    if (!selectedCompany) {
      return [...new Set(clients.map((client) => client.contact_name).filter(Boolean))]
    }

    return [
      ...new Set(
        clients
          .filter((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
          .map((client) => client.contact_name)
          .filter(Boolean)
      ),
    ]
  }, [clients, selectedCompany])
  const addresses = useMemo(
    () => [...new Set(clients.map((client) => buildAddress(client)).filter(Boolean))],
    [clients]
  )
  const technicianNames = useMemo(
    () => technicians.map((technician) => technician.name),
    [technicians]
  )

  useEffect(() => {
    if (!open) return

    async function load() {
      const [{ data: clientData }, { data: technicianData }] = await Promise.all([
        supabase.from('clients').select('id, contact_name, company_name, phone, address, city, parish').order('company_name'),
        supabase.from('technicians').select('id, name').order('name'),
      ])

      if (clientData) {
        setClients(clientData as Client[])
      }

      if (technicianData) {
        setTechnicians(technicianData as Technician[])
      }
    }

    load()
  }, [open])

  useEffect(() => {
    if (!open) {
      setSubject('')
      setAppointmentDate(new Date().toISOString().split('T')[0])
      setAppointmentTime('')
      setSelectedCompany('')
      setContactPerson('')
      setTelephone('')
      setSelectedTechnician('')
      setAdditionalTechnicians('')
      setAddress('')
      setLandmark('')
      setNotes('')
    }
  }, [open])

  function handleCompanySelect(company: string) {
    setSelectedCompany(company)
    const matchingClients = clients.filter((client) => client.company_name === company || client.contact_name === company)
    if (matchingClients.length === 0) return

    const [firstClient] = matchingClients
    setContactPerson(firstClient.contact_name || '')
    setTelephone(firstClient.phone || '')
    setAddress(buildAddress(firstClient))
  }

  function handleQuickAddClientSuccess(newClient: Client) {
    setClients((current) => [...current, newClient])

    const newName = newClient.company_name || newClient.contact_name || ''
    const newAddress = buildAddress(newClient)

    setSelectedCompany(newName)
    setContactPerson(newClient.contact_name || '')
    setTelephone(newClient.phone || '')
    setAddress(newAddress)
  }

  function handleQuickAddTechnicianSuccess(newTechnician: Technician) {
    setTechnicians((current) => [...current, newTechnician])
    setSelectedTechnician(newTechnician.name || '')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!subject.trim()) {
      toast.error('Appointment subject is required')
      return
    }

    if (!appointmentDate) {
      toast.error('Appointment date is required')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

    const clientRecord = clients.find((client) => client.company_name === selectedCompany || client.contact_name === selectedCompany)
    const technicianRecord = technicians.find((technician) => technician.name === selectedTechnician)
    const additionalTechnicianList = additionalTechnicians
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)

    const { error } = await supabase.from('jobs').insert({
      user_id: user.id,
      title: subject.trim(),
      description: notes.trim() || null,
      job_type: 'appointment',
      status: 'scheduled',
      priority: 'medium',
      scheduled_date: appointmentDate,
      scheduled_time: appointmentTime || null,
      address: address.trim() || null,
      client_id: clientRecord?.id || null,
      technician_id: technicianRecord?.id || null,
      is_recurring: false,
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

    if (error) {
      console.error('[AddAppointmentDialog] Failed to create appointment', error)
      toast.error(error.message || 'Failed to create appointment')
      setLoading(false)
      return
    }

    toast.success('Appointment created successfully')
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const labelClassName = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400'
  const sectionClassName = 'space-y-3 rounded-xl border border-[#2d3352] bg-[#151a2c] p-4'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 text-black hover:bg-emerald-400">
          <CalendarPlus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-[#2d3352] bg-[#0d1220] p-0 text-white">
        <div className="rounded-t-lg bg-gradient-to-r from-[#0f7d8a] via-[#154c79] to-[#1d365f] px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">New Appointment</DialogTitle>
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
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                    className="border-[#2d3352] bg-[#1e2235] text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Time</Label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(event) => setAppointmentTime(event.target.value)}
                    className="border-[#2d3352] bg-[#1e2235] text-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Subject</Label>
                <div className="flex items-center gap-1">
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Appointment subject"
                    className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSubject('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                  <button
                    type="button"
                    onClick={() => setSelectedCompany('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Contact Person</Label>
                  <div className="flex items-center gap-1">
                    <Combobox value={contactPerson} onChange={setContactPerson} options={contactNames} placeholder="Contact person" />
                    <button
                      type="button"
                      onClick={() => setContactPerson('')}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClassName}>Telephone</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      value={telephone}
                      onChange={(event) => setTelephone(event.target.value)}
                      placeholder="Telephone number"
                      className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setTelephone('')}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
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
                  <button
                    type="button"
                    onClick={() => setSelectedTechnician('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Additional Technicians</Label>
                <div className="flex items-center gap-1">
                  <Input
                    value={additionalTechnicians}
                    onChange={(event) => setAdditionalTechnicians(event.target.value)}
                    placeholder="Comma separated technician names"
                    className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAdditionalTechnicians('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
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
                  <Combobox value={address} onChange={setAddress} options={addresses} placeholder="Type or select address" />
                  <button
                    type="button"
                    onClick={() => setAddress('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClassName}>Address Landmark</Label>
                <div className="flex items-center gap-1">
                  <Input
                    value={landmark}
                    onChange={(event) => setLandmark(event.target.value)}
                    placeholder="Nearby landmark"
                    className="flex-1 border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setLandmark('')}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-red-900/40 text-red-400 hover:bg-red-900/60"
                  >
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
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Additional appointment notes..."
              className="min-h-[120px] border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[#2d3352] bg-transparent text-white hover:bg-[#1e2235]">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 text-black hover:bg-emerald-400">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Appointment
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
