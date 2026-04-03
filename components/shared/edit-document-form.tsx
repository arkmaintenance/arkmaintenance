'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Minus, Trash2, Save, X, ChevronDown, Layers } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  poNumber: string
  trn: string
  timeline: string
  isServiceContract: boolean
  recurringSchedule: string
  scopeOfWork: string
  validUntil: string
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

function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={ref} className={`relative flex-1 ${className}`}>
      <div className="flex">
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-[#2a2a4a] border-[#3a3a5a] text-white rounded-r-none border-r-0 flex-1"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="px-2 bg-[#2a2a4a] border border-[#3a3a5a] border-l-0 rounded-r-md text-gray-400 hover:text-white"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-xl max-h-48 overflow-y-auto">
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
      )}
    </div>
  )
}

// ─── ClearableField ───────────────────────────────────────────────────────────

function ClearableField({
  label,
  labelClass,
  value,
  onChange,
  options = [],
  placeholder,
  children,
}: {
  label: string
  labelClass?: string
  value: string
  onChange: (v: string) => void
  options?: string[]
  placeholder?: string
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className={`text-sm ${labelClass || 'text-gray-300'}`}>{label}</Label>
      <div className="flex gap-1 items-center">
        {options.length > 0 ? (
          <Combobox value={value} onChange={onChange} options={options} placeholder={placeholder} />
        ) : (
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"
          />
        )}
        {children}
        <button
          type="button"
          title="Clear field"
          onClick={() => onChange('')}
          className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initialValues.title)
  const [contactPerson, setContactPerson] = useState(initialValues.contactPerson)
  const [serviceLocation, setServiceLocation] = useState(initialValues.serviceLocation)
  const [address, setAddress] = useState(initialValues.address)
  const [paymentTerms, setPaymentTerms] = useState(initialValues.paymentTerms)
  const [poNumber, setPoNumber] = useState(initialValues.poNumber)
  const [trn, setTrn] = useState(initialValues.trn)
  const [timeline, setTimeline] = useState(initialValues.timeline)
  const [isServiceContract, setIsServiceContract] = useState(initialValues.isServiceContract)
  const [recurringSchedule, setRecurringSchedule] = useState(initialValues.recurringSchedule)
  const [scopeOfWork, setScopeOfWork] = useState(initialValues.scopeOfWork)
  const [validUntil, setValidUntil] = useState(initialValues.validUntil)
  const [status, setStatus] = useState(initialValues.status)
  const [notes, setNotes] = useState(initialValues.notes)
  const [items, setItems] = useState<DocItem[]>(initialValues.items)
  const [selectedClientId, setSelectedClientId] = useState(initialValues.selectedClientId)

  // ── Load DB options on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function loadOptions() {
      // Load all clients
      const { data: clientData } = await supabase
        .from('clients')
        .select('id, contact_name, company_name, address, city, parish, email, trn')
        .order('company_name')
      if (clientData) {
        setClients(clientData)
        setCompanyNames([...new Set(clientData.map(c => c.company_name).filter(Boolean))])
        setContactNames([...new Set(clientData.map(c => c.contact_name).filter(Boolean))])
        setAddresses([...new Set(clientData.map(c => [c.address, c.city, c.parish].filter(Boolean).join(', ')).filter(Boolean))])
      }

      // Load unique job titles from quotations
      const { data: quoteData } = await supabase
        .from('quotations')
        .select('title')
        .not('title', 'is', null)
      // Load unique job titles from invoices
      const { data: invData } = await supabase
        .from('invoices')
        .select('title')
        .not('title', 'is', null)

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
    }
    loadOptions()
  }, [])

  // When client is selected from DB, auto-fill related fields
  const handleClientSelect = (companyOrName: string) => {
    setSelectedClientId(companyOrName)
    const found = clients.find(
      c => c.company_name === companyOrName || c.contact_name === companyOrName
    )
    if (found) {
      if (found.contact_name && !contactPerson) setContactPerson(found.contact_name)
      const addr = [found.address, found.city, found.parish].filter(Boolean).join(', ')
      if (addr) setAddress(addr)
      if (found.trn) setTrn(found.trn)
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

  const addItem = () => setItems(prev => [...prev, { description: '', qty: 1, unit_price: 0, discount: 0, amount: 0 }])
  const addSection = () => setItems(prev => [...prev, { description: '', qty: 0, unit_price: 0, discount: 0, amount: 0, section: 'New Section' }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const subtotal = items.reduce((s, it) => s + (it.section ? 0 : it.amount), 0)

  const currentValues: EditFormValues = {
    title, contactPerson, serviceLocation, address, paymentTerms,
    poNumber, trn, timeline, isServiceContract, recurringSchedule,
    scopeOfWork, validUntil, status, notes, items, selectedClientId,
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-6 space-y-5 print:hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">
          Edit {docType === 'quotation' ? 'Quotation' : 'Invoice'}
        </h2>
        <span className="text-[#00BCD4] font-bold text-lg tracking-wide">{docNumber}</span>
      </div>

      {/* ── Row 1: Doc # (visible) + Date + Client selector ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs uppercase tracking-wider">
            {docType === 'quotation' ? 'Quotation' : 'Invoice'} #
          </Label>
          <div className="h-9 flex items-center px-3 rounded-md border border-[#00BCD4] bg-[#00BCD4]/10 text-[#00BCD4] font-bold text-sm">
            {docNumber}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs uppercase tracking-wider">Date</Label>
          <div className="h-9 flex items-center px-3 rounded-md border border-[#3a3a5a] bg-[#2a2a4a] text-gray-300 text-sm">
            {docDate}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-gray-400 text-xs uppercase tracking-wider">Client / Company</Label>
          <div className="flex gap-1 items-center">
            <Combobox
              value={selectedClientId}
              onChange={handleClientSelect}
              options={companyNames}
              placeholder="Select or type company..."
            />
            <button type="button" title="Clear" onClick={() => setSelectedClientId('')}
              className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
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
          <Label className="text-gray-300 text-sm">Payment Terms</Label>
          <div className="flex gap-1 items-center">
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                {['COD','Net 15','Net 30','Net 60','50% Deposit','7 Days','30 Days'].map(t => (
                  <SelectItem key={t} value={t} className="text-white hover:bg-[#2a2a4a]">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" title="Clear" onClick={() => setPaymentTerms('COD')}
              className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <ClearableField label="PO Number" value={poNumber} onChange={setPoNumber} placeholder="PO Number" />
        <ClearableField label="TRN" labelClass="text-[#E91E63]" value={trn} onChange={setTrn} placeholder="TRN" />
      </div>

      {/* ── Service Description ── */}
      <ClearableField label="Service Description" value={title} onChange={setTitle}
        options={jobTitles} placeholder="Type or select service description...">
      </ClearableField>

      {/* ── Line Items ── */}
      <div className="border border-[#3a3a5a] rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-[#2a2a4a] px-3 py-2 flex items-center justify-between">
          <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Line Items</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost"
              onClick={addSection}
              className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs gap-1 h-7 px-2">
              <Layers className="h-3.5 w-3.5" /> Add Section
            </Button>
            <Button type="button" size="sm" variant="ghost"
              onClick={addItem}
              className="text-[#00BCD4] hover:text-[#00BCD4] hover:bg-[#00BCD4]/10 text-xs gap-1 h-7 px-2">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-12 gap-2 px-3 py-1 bg-[#141428]">
          <div className="col-span-4 text-[10px] text-gray-500 uppercase">Description</div>
          <div className="col-span-2 text-[10px] text-gray-500 uppercase">Qty</div>
          <div className="col-span-2 text-[10px] text-gray-500 uppercase">Unit Price</div>
          <div className="col-span-1 text-[10px] text-gray-500 uppercase">Disc.</div>
          <div className="col-span-2 text-[10px] text-gray-500 uppercase text-right">Amount</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#2a2a4a]">
          {items.map((item, index) =>
            item.section !== undefined ? (
              // Section header row
              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-[#FF6B00]/10">
                <Layers className="h-3.5 w-3.5 text-[#FF6B00] shrink-0" />
                <Input
                  value={item.section}
                  onChange={e => updateItem(index, 'section', e.target.value)}
                  placeholder="Section name..."
                  className="bg-transparent border-none text-[#FF6B00] font-semibold text-sm p-0 h-auto focus-visible:ring-0 flex-1"
                />
                <button type="button" onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              // Item row
              <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-[#2a2a4a]/40">
                <div className="col-span-4">
                  <Combobox
                    value={item.description}
                    onChange={v => updateItem(index, 'description', v)}
                    options={lineDescriptions}
                    placeholder="Description..."
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => updateItem(index, 'qty', Math.max(1, item.qty - 1))}
                      className="w-6 h-6 rounded bg-[#3a3a5a] text-white text-xs flex items-center justify-center hover:bg-[#FF6B00]/80 shrink-0">
                      <Minus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={e => updateItem(index, 'qty', e.target.value)}
                      className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-center px-1 w-full"
                      min={1}
                    />
                    <button type="button" onClick={() => updateItem(index, 'qty', item.qty + 1)}
                      className="w-6 h-6 rounded bg-[#3a3a5a] text-white text-xs flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={e => updateItem(index, 'unit_price', e.target.value)}
                    className="bg-[#2a2a4a] border-[#3a3a5a] text-white"
                    min={0}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={e => updateItem(index, 'discount', e.target.value)}
                    className="bg-[#2a2a4a] border-[#3a3a5a] text-white"
                    min={0}
                  />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[#FF6B00] font-bold text-sm">
                    JMD {item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#141428] border-t border-[#3a3a5a]">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={addSection}
              className="text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs gap-1 h-7 px-2">
              <Layers className="h-3.5 w-3.5" /> Add Section
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={addItem}
              className="text-[#00BCD4] hover:bg-[#00BCD4]/10 text-xs gap-1 h-7 px-2">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
          <span className="text-[#FF6B00] font-bold">Total: JMD {subtotal.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Timeline + Service Contract ── */}
      <div className="grid grid-cols-2 gap-4">
        <ClearableField label="Job Completion Timeline" value={timeline} onChange={setTimeline}
          options={['1 Day','2-3 Days','3-5 Days','1 Week','2 Weeks','1 Month']}
          placeholder="e.g. 3-5 Days...">
        </ClearableField>
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">Recurring Schedule</Label>
          <div className="flex gap-1 items-center">
            <Select value={recurringSchedule} onValueChange={setRecurringSchedule}>
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                {['one-time','weekly','bi-weekly','monthly','quarterly','semi-annual','annual'].map(v => (
                  <SelectItem key={v} value={v} className="text-white capitalize">{v.replace('-',' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" title="Reset" onClick={() => setRecurringSchedule('one-time')}
              className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Service Contract toggle */}
      <div className="flex items-center gap-3">
        <Switch checked={isServiceContract} onCheckedChange={setIsServiceContract} className="data-[state=checked]:bg-[#00BCD4]" />
        <Label className="text-gray-300 text-sm">Service Contract</Label>
      </div>

      {/* ── Scope of Work (quotation only) ── */}
      {docType === 'quotation' && (
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">Scope of Work</Label>
          <div className="flex gap-1">
            <Textarea
              value={scopeOfWork}
              onChange={e => setScopeOfWork(e.target.value)}
              placeholder="Describe the scope of work..."
              className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[70px] flex-1"
            />
            <button type="button" title="Clear" onClick={() => setScopeOfWork('')}
              className="self-start p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Valid Until + Status ── */}
      <div className="grid grid-cols-2 gap-4">
        {docType === 'quotation' && (
          <div className="space-y-1">
            <Label className="text-gray-300 text-sm">Valid Until</Label>
            <div className="flex gap-1 items-center">
              <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
              <button type="button" onClick={() => setValidUntil('')}
                className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-gray-300 text-sm">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
              {(docType === 'quotation'
                ? ['pending','sent','accepted','rejected','expired']
                : ['draft','sent','paid','overdue','cancelled']
              ).map(s => (
                <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="space-y-1">
        <Label className="text-gray-300 text-sm">Notes</Label>
        <div className="flex gap-1">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[70px] flex-1"
          />
          <button type="button" title="Clear" onClick={() => setNotes('')}
            className="self-start p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Save / Cancel ── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a4a]">
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
