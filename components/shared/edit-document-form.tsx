'use client'

import { useEffect, useState, useRef, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus, Trash2, Save, X, ChevronDown, Layers, Calendar } from 'lucide-react'

// ─── Types (v2) ───────────────────────────────────────────────────────────────

export interface DocItem {
  description: string
  qty: number
  unit_price: number
  discount: number
  amount: number
  section?: string  // optional section heading
}

export interface ClientOption {
  id: string
  contact_name: string
  company_name: string
  address: string
  city: string
  parish: string
  email: string
  trn?: string
}

export interface EditFormValues {
  title: string
  contactPerson: string
  serviceLocation: string
  address: string
  paymentTerms: string
  paymentMethod: string        // cash | bank_transfer | cheque | credit_card
  poNumber: string
  trn: string
  timeline: string
  isServiceContract: boolean
  recurringSchedule: string
  scopeOfWork: string
  scopeTemplate: string       // which checklist template key
  validUntil: string
  issuedDate: string          // YYYY-MM-DD
  dueDate: string             // YYYY-MM-DD
  status: string
  notes: string
  items: DocItem[]
  selectedClientId: string
}

interface EditDocumentFormProps {
  docType: 'quotation' | 'invoice'
  docNumber: string
  docDate: string
  initialValues: EditFormValues
  saving: boolean
  onSave: (values: EditFormValues) => void
  onCancel: () => void
}

// ─── Combobox ─────────────────────────────────────────────────────────────────

const Combobox = forwardRef<HTMLInputElement, {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  className?: string
}>(function Combobox({ value, onChange, options, placeholder, className = '' }, forwardedRef) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery]     = useState(value)
  const [pos, setPos]         = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const dropRef      = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Expose internal input to parent via forwardedRef
  useEffect(() => {
    if (!forwardedRef) return
    if (typeof forwardedRef === 'function') forwardedRef(inputRef.current)
    else forwardedRef.current = inputRef.current
  })

  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        containerRef.current && !containerRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Compute portal position whenever open
  useEffect(() => {
    if (open && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 2, left: r.left + window.scrollX, width: r.width })

    }
  }, [open, options.length])

  const filtered = query.trim() === ''
    ? options
    : options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  const dropdown = filtered.length > 0 && (
    <div
      ref={dropRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99998 }}
      className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-2xl max-h-52 overflow-y-auto"
    >
      {filtered.map((opt, i) => (
        <button
          key={i}
          type="button"
          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#FF6B00]/20 truncate"
          onMouseDown={() => { onChange(opt); setQuery(opt); setOpen(false) }}
        >
          {opt}
        </button>
      ))}
    </div>
  )

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="flex">
        <Input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-[#2a2a4a] border-[#3a3a5a] text-white rounded-r-none border-r-0 flex-1 placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => {
            // When clicking the chevron to open, clear the query to show all options
            if (!open) setQuery('')
            setOpen(o => !o)
            inputRef.current?.focus()
          }}
          className="px-2 bg-[#2a2a4a] border border-[#3a3a5a] border-l-0 rounded-r-md text-gray-400 hover:text-white"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      {mounted && open && createPortal(dropdown, document.body)}
    </div>
  )
})

// ─── ClearableField ───────────────────────────────────────────────────────────

function ClearableField({
  label,
  labelClass,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  labelClass?: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  placeholder?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const useCombo = options !== undefined

  // + button: clears the text so the full dropdown opens on next focus/click
  const handleAdd = () => {
    onChange('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="space-y-1">
      <Label className={`text-sm font-medium ${labelClass || 'text-gray-300'}`}>{label}</Label>
      <div className="flex gap-1 items-center">
        {useCombo ? (
          <Combobox
            ref={inputRef}
            value={value}
            onChange={onChange}
            options={options!}
            placeholder={placeholder}
          />
        ) : (
          <Input
            ref={inputRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1 placeholder:text-gray-500"
          />
        )}
        {/* + opens / resets the dropdown */}
        <button
          type="button"
          title="Open list"
          onClick={handleAdd}
          className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        {/* − clears the field */}
        <button
          type="button"
          title="Clear field"
          onClick={() => onChange('')}
          className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen]         = useState(false)
  const [mounted, setMounted]   = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const today  = new Date()

  // portal only works client-side
  useEffect(() => { setMounted(true) }, [])

  // Derive view month/year from value; re-sync when value changes (e.g. loaded from DB)
  const toYM = (v: string) => {
    if (!v) return { y: today.getFullYear(), m: today.getMonth() }
    const d = new Date(v + 'T00:00:00')
    return { y: d.getFullYear(), m: d.getMonth() }
  }
  const [viewYear,  setViewYear]  = useState(() => toYM(value).y)
  const [viewMonth, setViewMonth] = useState(() => toYM(value).m)
  useEffect(() => {
    const { y, m } = toYM(value)
    setViewYear(y)
    setViewMonth(m)
  }, [value])

  // Position the floating popup under the button
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const updatePos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width })
    }
  }
  useEffect(() => {
    if (open) updatePos()
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selParts = value ? (() => {
    const d = new Date(value + 'T00:00:00')
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
  })() : null

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const goToday = () => {
    const d = new Date()
    onChange(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
    setOpen(false)
  }

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Pick a date'

  const popup = (
    <div
      ref={popRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 99999, minWidth: 272 }}
      className="bg-[#1a1a2e] border border-[#00BCD4]/40 rounded-xl shadow-2xl p-3"
    >
      {/* Month / Year nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 rounded-md bg-[#2a2a4a] text-gray-300 hover:bg-[#3a3a5a] flex items-center justify-center text-lg font-bold">
          ‹
        </button>
        <div className="flex items-center gap-1">
          <select
            value={viewMonth}
            onChange={e => setViewMonth(Number(e.target.value))}
            className="bg-[#2a2a4a] border border-[#3a3a5a] text-white text-sm rounded-md px-1.5 py-0.5 cursor-pointer"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            className="bg-[#2a2a4a] border border-[#3a3a5a] text-white text-sm rounded-md px-1.5 py-0.5 cursor-pointer w-[72px]"
          >
            {Array.from({ length: 12 }, (_, i) => today.getFullYear() - 6 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 rounded-md bg-[#2a2a4a] text-gray-300 hover:bg-[#3a3a5a] flex items-center justify-center text-lg font-bold">
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] text-gray-500 font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-8" />
          const isSelected = selParts
            ? day === selParts.day && viewMonth === selParts.month && viewYear === selParts.year
            : false
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(day)}
              className={[
                'h-8 w-full rounded-md text-sm font-medium transition-colors',
                isSelected              ? 'bg-[#FF6B00] text-white'              : '',
                isToday && !isSelected  ? 'border border-[#00BCD4] text-[#00BCD4]' : '',
                !isSelected && !isToday ? 'text-gray-300 hover:bg-[#2a2a4a]'     : '',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="flex justify-between mt-3 pt-2 border-t border-[#2a2a4a]">
        <button type="button" onClick={goToday} className="text-xs text-[#00BCD4] hover:underline">Today</button>
        <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="text-xs text-red-400 hover:underline">Clear</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-1">
      <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</Label>
      <div className="flex gap-1 items-center">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 h-9 flex items-center justify-between px-3 rounded-md border border-[#3a3a5a] bg-[#2a2a4a] text-sm hover:border-[#00BCD4] transition-colors"
        >
          <span className={value ? 'text-white' : 'text-gray-500'}>{displayValue}</span>
          <Calendar className="h-4 w-4 text-[#00BCD4] shrink-0 ml-2" />
        </button>
        <button
          type="button"
          title="Clear date"
          onClick={() => onChange('')}
          className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
      {mounted && open && createPortal(popup, document.body)}
    </div>
  )
}

// ─��─ Main Component ───────────────────────────────────────────────────────────

export function EditDocumentForm({
  docType,
  docNumber,
  docDate,
  initialValues,
  saving,
  onSave,
  onCancel,
}: EditDocumentFormProps) {
  const supabase = createClient()

  // ── DB-loaded option lists ──────────────────────────────────────────────────
  const [clients, setClients] = useState<ClientOption[]>([])
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [addresses, setAddresses] = useState<string[]>([])
  const [contactNames, setContactNames] = useState<string[]>([])
  const [companyNames, setCompanyNames] = useState<string[]>([])
  const [lineDescriptions, setLineDescriptions] = useState<string[]>([])
  const [serviceOptions, setServiceOptions] = useState<{ name: string; description: string; base_price: number }[]>([])

  // ���─ Form state ──────────────────────────────────���───────────────────────────
  const [title, setTitle] = useState(initialValues.title)
  const [contactPerson, setContactPerson] = useState(initialValues.contactPerson)
  const [serviceLocation, setServiceLocation] = useState(initialValues.serviceLocation)
  const [address, setAddress] = useState(initialValues.address)
  const [paymentTerms, setPaymentTerms] = useState(initialValues.paymentTerms)
  const [paymentMethod, setPaymentMethod] = useState(initialValues.paymentMethod || 'bank_transfer')
  const [poNumber, setPoNumber] = useState(initialValues.poNumber)
  const [trn, setTrn] = useState(initialValues.trn)
  const [timeline, setTimeline] = useState(initialValues.timeline)
  const [isServiceContract, setIsServiceContract] = useState(initialValues.isServiceContract)
  const [recurringSchedule, setRecurringSchedule] = useState(initialValues.recurringSchedule)
  const [scopeOfWork, setScopeOfWork] = useState(initialValues.scopeOfWork)
  const [scopeTemplate, setScopeTemplate] = useState(initialValues.scopeTemplate || '')
  const [validUntil, setValidUntil] = useState(initialValues.validUntil)
  const [issuedDate, setIssuedDate] = useState(initialValues.issuedDate || '')
  const [dueDate, setDueDate]       = useState(initialValues.dueDate || '')
  const [status, setStatus] = useState(initialValues.status)
  const [notes, setNotes] = useState(initialValues.notes)
  const [items, setItems] = useState<DocItem[]>(initialValues.items)
  const [selectedClientId, setSelectedClientId] = useState(initialValues.selectedClientId)

  // ── Load DB options on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function loadOptions() {
      // Load all clients
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, contact_name, company_name, address, city, parish, email, trn')
        .order('company_name')
      if (clientData) {
        setClients(clientData)
        const compNames = [...new Set(clientData.map(c => c.company_name).filter(Boolean))]
        setCompanyNames(compNames)
        // Pre-filter contact names by already-selected company if one is set
        const preSelectedCompany = initialValues.selectedClientId
        const relevantClients = preSelectedCompany
          ? clientData.filter(c => c.company_name === preSelectedCompany)
          : clientData
        setContactNames([...new Set(relevantClients.map(c => c.contact_name).filter(Boolean))])
        setAddresses([...new Set(clientData.map(c => [c.address, c.city, c.parish].filter(Boolean).join(', ')).filter(Boolean))])
      }

      // Load unique job titles from quotations + invoices
      const { data: quoteData } = await supabase.from('quotations').select('title').not('title', 'is', null)
      const { data: invData } = await supabase.from('invoices').select('title').not('title', 'is', null)
      const allTitles = [
        ...(quoteData || []).map((r: any) => r.title),
        ...(invData || []).map((r: any) => r.title),
      ].filter(Boolean)
      setJobTitles([...new Set(allTitles)])

      // Load unique line item descriptions
      const { data: qItemData } = await supabase.from('quotations').select('items')
      const { data: iItemData } = await supabase.from('invoices').select('items')
      const allDescs: string[] = []
      for (const row of [...(qItemData || []), ...(iItemData || [])]) {
        try {
          const parsed = typeof row.items === 'string' ? JSON.parse(row.items) : row.items || []
          for (const item of parsed) {
            if (item.description) allDescs.push(item.description)
          }
        } catch {}
      }
      setLineDescriptions([...new Set(allDescs)])

      // Load services catalogue — names become the primary dropdown options
      const { data: svcData } = await supabase
        .from('services')
        .select('name, description, base_price')
        .eq('status', 'active')
        .order('category')
        .order('name')
      if (svcData && svcData.length > 0) {
        setServiceOptions(svcData.map(s => ({ name: s.name, description: s.description || '', base_price: Number(s.base_price) })))
        // Prepend service names to the description dropdown (service names first, then historical)
        const svcNames = svcData.map(s => s.name)
        setLineDescriptions(prev => [...new Set([...svcNames, ...prev])])
      }
    }
    loadOptions()
  }, [])

  // When company is selected, auto-fill contact, address, TRN and update contact name list
  const handleClientSelect = (companyOrName: string) => {
    setSelectedClientId(companyOrName)
    // Find all clients matching this company so we can show their contacts
    const matchingClients = clients.filter(c => c.company_name === companyOrName)
    if (matchingClients.length > 0) {
      // Update contact name dropdown to only show contacts for this company
      setContactNames(matchingClients.map(c => c.contact_name).filter(Boolean))
      // Auto-fill first contact if field is blank
      const first = matchingClients[0]
      if (first.contact_name && !contactPerson) setContactPerson(first.contact_name)
      const addr = [first.address, first.city, first.parish].filter(Boolean).join(', ')
      if (addr) setAddress(addr)
      if (first.trn) setTrn(first.trn)
    }
  }

  // ── Item helpers ────────────────────────────────────────────────────────────
  const recalc = (item: DocItem): DocItem => ({
    ...item,
    amount: item.qty * item.unit_price - (item.discount || 0),
  })

  const updateItem = (index: number, field: keyof DocItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[index] }
      if (field === 'qty' || field === 'unit_price' || field === 'discount') {
        ;(item as any)[field] = typeof value === 'string' ? parseFloat(value) || 0 : value
        next[index] = recalc(item)
      } else {
        ;(item as any)[field] = value
        next[index] = item
      }
      return next
    })
  }

  // Patch multiple fields atomically (avoids stale-closure when setting description + price together)
  const updateItemFields = (index: number, patches: Partial<DocItem>) => {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[index], ...patches }
      next[index] = recalc(item)
      return next
    })
  }

  const addItem = () => setItems(prev => [...prev, { description: '', qty: 1, unit_price: 0, discount: 0, amount: 0 }])
  const addSection = () => setItems(prev => [...prev, { description: '', qty: 0, unit_price: 0, discount: 0, amount: 0, section: 'New Section' }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const subtotal = items.reduce((s, it) => s + (it.section ? 0 : it.amount), 0)

  const currentValues: EditFormValues = {
    title, contactPerson, serviceLocation, address, paymentTerms, paymentMethod,
    poNumber, trn, timeline, isServiceContract, recurringSchedule,
    scopeOfWork, scopeTemplate, validUntil, issuedDate, dueDate, status, notes, items, selectedClientId,
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-6 space-y-5 print:hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[#2a2a4a] pb-3">
        <h2 className="text-white text-xl font-bold">
          Edit {docType === 'quotation' ? 'Quotation' : 'Invoice'}
        </h2>
        <span className="bg-[#00BCD4] text-white font-bold text-sm px-3 py-1 rounded-full tracking-wide">{docNumber}</span>
      </div>

      {/* ── Row 1: Doc # + Issued Date + Client selector ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            {docType === 'quotation' ? 'Quotation' : 'Invoice'} #
          </Label>
          <div className="h-9 flex items-center px-3 rounded-md border border-[#00BCD4] bg-[#00BCD4]/10 text-[#00BCD4] font-bold text-sm">
            {docNumber}
          </div>
        </div>
        <DatePickerField
          label={docType === 'quotation' ? 'Quote Date' : 'Issued Date'}
          value={issuedDate}
          onChange={setIssuedDate}
        />
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Client / Company</Label>
          <div className="flex gap-1 items-center">
            <Combobox
              value={selectedClientId}
              onChange={handleClientSelect}
              options={companyNames}
              placeholder="Select or type company..."
            />
            <button type="button" title="Open list"
              onClick={() => { setSelectedClientId('') }}
              className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Clear" onClick={() => setSelectedClientId('')}
              className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Contact Person + Service Location ── */}
      <div className="grid grid-cols-2 gap-4">
        <ClearableField label="Contact Person" value={contactPerson} onChange={setContactPerson}
          options={contactNames} placeholder="Select or type contact name...">
        </ClearableField>
        <ClearableField label="Service Location" value={serviceLocation} onChange={setServiceLocation}
          options={['Kingston', 'St. Andrew', 'St. Catherine', 'Portmore', 'Montego Bay', 'Ocho Rios', 'Mandeville']}
          placeholder="Select location...">
        </ClearableField>
      </div>

      {/* ── Row 3: Address ── */}
      <ClearableField label="Address" value={address} onChange={setAddress}
        options={addresses} placeholder="Select or type address...">
      </ClearableField>

      {/* ── Row 4: Payment Terms + PO # + TRN ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm font-medium">Payment Terms</Label>
          <div className="flex gap-1 items-center">
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                {['COD','Net 15','Net 30','Net 60','50% Deposit','7 Days','30 Days'].map(t => (
                  <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" title="Open" onClick={() => {}}
              className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Reset to COD" onClick={() => setPaymentTerms('COD')}
              className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <ClearableField label="PO Number" value={poNumber} onChange={setPoNumber} placeholder="PO Number" />
        <ClearableField label="TRN" labelClass="text-[#E91E63] font-medium" value={trn} onChange={setTrn} placeholder="TRN" />
      </div>

      {/* ── Service Description ── */}
      <ClearableField label="Service Description" value={title} onChange={setTitle}
        options={jobTitles} placeholder="Type or select service description...">
      </ClearableField>

      {/* ── Line Items ── */}
      <div className="border border-[#3a3a5a] rounded-lg overflow-hidden">
        {/* Table header bar */}
        <div className="bg-[#0d0d1f] px-3 py-2 flex items-center justify-between">
          <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Line Items</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={addSection}
              className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/20 text-xs gap-1 h-7 px-2">
              <Layers className="h-3.5 w-3.5" /> + Section
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={addItem}
              className="text-[#00BCD4] hover:text-[#00BCD4] hover:bg-[#00BCD4]/20 text-xs gap-1 h-7 px-2">
              <Plus className="h-3.5 w-3.5" /> + Item
            </Button>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-[#141428] border-b border-[#3a3a5a]">
                <th className="text-left text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[35%]">Description</th>
                <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[14%]">Qty (+ / −)</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[18%]">Unit Price (JMD)</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[12%]">Discount</th>
                <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[14%]">Amount</th>
                <th className="w-[7%] px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a4a]">
              {items.map((item, index) =>
                item.section !== undefined ? (
                  /* Section heading row */
                  <tr key={index} className="bg-[#FF6B00]/10 border-l-4 border-[#FF6B00]">
                    <td colSpan={6} className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-[#FF6B00] shrink-0" />
                        <Input value={item.section}
                          onChange={e => updateItem(index, 'section', e.target.value)}
                          placeholder="Section name..."
                          className="bg-transparent border-none text-[#FF6B00] font-semibold text-sm p-0 h-auto focus-visible:ring-0 flex-1" />
                        <button type="button" onClick={() => removeItem(index)}
                          className="w-6 h-6 rounded bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Line item row */
                  <tr key={index} className="hover:bg-[#2a2a4a]/60">
                    {/* Description combobox */}
                    <td className="px-3 py-2">
                      <Combobox value={item.description}
                        onChange={v => {
                          const match = serviceOptions.find(s => s.name === v)
                          if (match && match.base_price > 0) {
                            updateItemFields(index, { description: v, unit_price: match.base_price })
                          } else {
                            updateItem(index, 'description', v)
                          }
                        }}
                        options={lineDescriptions}
                        placeholder="Type or select service..." />
                    </td>
                    {/* Qty with − / + */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-0.5 justify-center">
                        <button type="button"
                          onClick={() => updateItem(index, 'qty', Math.max(1, item.qty - 1))}
                          className="w-6 h-6 rounded bg-red-900/50 text-red-300 text-xs flex items-center justify-center hover:bg-red-800 shrink-0">
                          <Minus className="h-3 w-3" />
                        </button>
                        <Input type="number" value={item.qty}
                          onChange={e => updateItem(index, 'qty', e.target.value)}
                          className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-center px-1 w-14" min={1} />
                        <button type="button"
                          onClick={() => updateItem(index, 'qty', item.qty + 1)}
                          className="w-6 h-6 rounded bg-[#00BCD4]/30 text-[#00BCD4] text-xs flex items-center justify-center hover:bg-[#00BCD4]/60 shrink-0">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    {/* Unit Price */}
                    <td className="px-2 py-2">
                      <Input type="number" value={item.unit_price}
                        onChange={e => updateItem(index, 'unit_price', e.target.value)}
                        className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-right"
                        min={0} placeholder="0" />
                    </td>
                    {/* Discount */}
                    <td className="px-2 py-2">
                      <Input type="number" value={item.discount}
                        onChange={e => updateItem(index, 'discount', e.target.value)}
                        className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-right"
                        min={0} placeholder="0" />
                    </td>
                    {/* Amount (calculated) */}
                    <td className="px-3 py-2 text-right font-bold text-[#FF6B00]">
                      {item.amount.toLocaleString()}
                    </td>
                    {/* Delete */}
                    <td className="px-2 py-2 text-center">
                      <button type="button" onClick={() => removeItem(index)}
                        className="w-7 h-7 rounded bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/70 mx-auto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              )}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 text-sm py-6">
                    No items yet — click <span className="text-[#00BCD4] font-semibold">+ Item</span> to add one
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer total row */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#0d0d1f] border-t border-[#3a3a5a]">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={addSection}
              className="text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs gap-1 h-7 px-2">
              <Layers className="h-3.5 w-3.5" /> + Section
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={addItem}
              className="text-[#00BCD4] hover:bg-[#00BCD4]/10 text-xs gap-1 h-7 px-2">
              <Plus className="h-3.5 w-3.5" /> + Item
            </Button>
          </div>
          <div className="text-[#FF6B00] font-bold text-base">
            Total: JMD {subtotal.toLocaleString()}
          </div>
        </div>
      </div>
      {/* ── Timeline + Recurring Schedule ── */}
      <div className="grid grid-cols-2 gap-4">
        <ClearableField label="Job Completion Timeline" value={timeline} onChange={setTimeline}
          options={['1 Day','2-3 Days','3-5 Days','1 Week','2 Weeks','1 Month']}
          placeholder="e.g. 3-5 Days..." />
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm font-medium">Recurring Schedule</Label>
          <div className="flex gap-1 items-center">
            <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                {['one-time','weekly','bi-weekly','monthly','quarterly','semi-annual','annual'].map(v => (
                  <SelectItem key={v} value={v} className="text-white capitalize">{v.replace('-',' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" title="Open" onClick={() => {}}
              className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Reset to one-time" onClick={() => setRecurringSchedule('one-time')}
              className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Service Contract toggle */}
      <div className="flex items-center gap-3 py-1">
        <Switch checked={isServiceContract} onCheckedChange={setIsServiceContract} className="data-[state=checked]:bg-[#00BCD4]" />
        <Label className="text-gray-300 text-sm font-medium">Service Contract</Label>
      </div>

      {/* ── Payment Method (invoice only) ── */}
      {docType === 'invoice' && (
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm font-medium">Payment Method</Label>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'cash', label: 'Cash' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'credit_card', label: 'Credit Card' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setPaymentMethod(opt.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  paymentMethod === opt.value
                    ? 'border-[#FF6B00] bg-[#FF6B00] text-white'
                    : 'border-[#3a3a5a] bg-[#2a2a4a] text-gray-300 hover:border-[#FF6B00]/50'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Scope of Work (quotation only) ── */}
      {docType === 'quotation' && (
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm font-medium">Scope of Work Template</Label>
          <div className="flex gap-1 items-center">
            <Select value={scopeTemplate || 'none'} onValueChange={v => setScopeTemplate(v === 'none' ? '' : v)}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1">
                <SelectValue placeholder="Select a scope of work template..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                <SelectItem value="none" className="text-gray-400 italic">None / Custom</SelectItem>
                <SelectItem value="ac_servicing" className="text-white">16-Point Air Conditioning Servicing</SelectItem>
                <SelectItem value="refrigeration" className="text-white">16-Point Refrigeration Servicing</SelectItem>
                <SelectItem value="exhaust" className="text-white">Kitchen Exhaust System Checklist</SelectItem>
                <SelectItem value="ice_machine" className="text-white">16-Point Ice Machine Servicing</SelectItem>
              </SelectContent>
            </Select>
            <button type="button" title="Open" onClick={() => {}}
              className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Clear scope template" onClick={() => setScopeTemplate('')}
              className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
          {scopeTemplate && (
            <div className="text-xs text-[#00BCD4] bg-[#00BCD4]/10 border border-[#00BCD4]/30 rounded-md px-3 py-2">
              Template selected — scope appears on the printed quotation below totals and banking details.
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-gray-500 text-xs">Custom notes (appended below template)</Label>
            <div className="flex gap-1">
              <Textarea value={scopeOfWork} onChange={e => setScopeOfWork(e.target.value)}
                placeholder="Add any custom scope notes..."
                className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[60px] flex-1 placeholder:text-gray-500 text-sm" />
              <button type="button" title="Clear" onClick={() => setScopeOfWork('')}
                className="self-start w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm font-medium">Status</Label>
          <div className="flex gap-1 items-center">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                {(docType === 'quotation'
                  ? ['pending','sent','accepted','rejected','expired']
                  : ['draft','sent','paid','overdue','cancelled']
                ).map(s => (
                  <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" title="Open" onClick={() => {}}
              className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Reset status" onClick={() => setStatus(docType === 'quotation' ? 'pending' : 'draft')}
              className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="space-y-1">
        <Label className="text-gray-300 text-sm font-medium">Notes</Label>
        <div className="flex gap-1">
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..."
            className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[70px] flex-1 placeholder:text-gray-500" />
          <button type="button" title="Clear" onClick={() => setNotes('')}
            className="self-start w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Save / Cancel ── */}
      <div className="flex justify-end gap-3 pt-3 border-t border-[#2a2a4a]">
        <Button variant="outline" onClick={onCancel}
          className="border-[#3a3a5a] text-white hover:bg-[#2a2a4a] gap-2">
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button onClick={() => onSave(currentValues)} disabled={saving}
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
