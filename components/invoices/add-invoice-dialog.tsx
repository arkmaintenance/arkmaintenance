'use client'

import { useEffect, useState, useRef, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Minus, Loader2, Trash2, ChevronDown } from 'lucide-react'
import { QuickAddClientDialog } from '@/components/shared/quick-add-client-dialog'

// ─── Inline Combobox (portal-based, sort-to-top) ─────────────────────────────

function sortOptions(options: string[], query: string, selected: string): { opt: string; isMatch: boolean }[] {
  if (!query.trim() && !selected) return options.map(o => ({ opt: o, isMatch: false }))
  const q = query.trim().toLowerCase()
  const scored = options.map(o => {
    const lower = o.toLowerCase()
    let score = 0
    if (selected && o === selected) score += 1000
    if (q) {
      if (lower.startsWith(q)) score += 100
      else if (lower.includes(q)) score += 50
    }
    return { opt: o, score, isMatch: q ? lower.includes(q) : o === selected }
  })
  return scored.sort((a, b) => b.score - a.score)
}

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
    else if (fwdRef) (fwdRef as any).current = inputRef.current
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

  // Sort: matches/selected float to top, all others remain below
  const sorted = sortOptions(options, query, value)

  const dropdown = open && (
    options.length === 0 ? (
      <div ref={dropRef}
        style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
        className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-2xl p-3 text-gray-400 text-sm pointer-events-auto">
        Loading records...
      </div>
    ) : (
      <div ref={dropRef}
        style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
        className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-md shadow-2xl max-h-56 overflow-y-auto pointer-events-auto">
        {sorted.map(({ opt, isMatch }, i) => (
          <button key={i} type="button"
            className={[
              'w-full text-left px-3 py-2 text-sm truncate cursor-pointer transition-colors',
              opt === value
                ? 'bg-[#FF6B00]/25 text-white font-semibold border-l-2 border-[#FF6B00]'
                : isMatch
                ? 'text-white hover:bg-[#FF6B00]/20'
                : 'text-gray-400 hover:bg-[#2a2a4a] hover:text-gray-200'
            ].join(' ')}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(opt)
              setQuery(opt)
              setOpen(false)
            }}>
            {isMatch && query.trim() ? (() => {
              const q = query.trim()
              const idx = opt.toLowerCase().indexOf(q.toLowerCase())
              if (idx === -1) return opt
              return <>
                {opt.slice(0, idx)}
                <span className="text-[#FF6B00] font-bold">{opt.slice(idx, idx + q.length)}</span>
                {opt.slice(idx + q.length)}
              </>
            })() : opt}
          </button>
        ))}
      </div>
    )
  )

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex">
        <Input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="bg-[#2a2a4a] border-[#3a3a5a] text-white rounded-r-none border-r-0 flex-1 placeholder:text-gray-500" />
        <button type="button"
          onClick={() => { if (!open) setQuery(''); setOpen(o => !o); inputRef.current?.focus() }}
          className="px-2 bg-[#2a2a4a] border border-[#3a3a5a] border-l-0 rounded-r-md text-gray-400 hover:text-white">
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      {mounted && open && <DialogPortal>{dropdown}</DialogPortal>}
    </div>
  )
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client { id: string; contact_name: string; company_name: string | null; address?: string; city?: string; parish?: string; trn?: string }
interface ServiceOption { name: string; base_price: number }
interface LineItem { id: string; description: string; quantity: number; unit_price: number; discount: number; total: number }
interface AddInvoiceDialogProps { clients: Client[] }

// ─── Component ────────────────────────────────────────────────────────────────

export function AddInvoiceDialog({ clients: initialClients }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // DB-loaded options
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [companyNames, setCompanyNames] = useState<string[]>(() => 
    [...new Set(initialClients.map(c => String(c.company_name || c.contact_name || '')).filter(Boolean))]
  )
  const [contactNames, setContactNames] = useState<string[]>(() => 
    [...new Set(initialClients.map(c => String(c.contact_name || '')).filter(Boolean))]
  )
  const [addresses, setAddresses] = useState<string[]>([])
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [serviceNames, setServiceNames] = useState<string[]>([])
  const [jobTitles, setJobTitles] = useState<string[]>([])

  // Form state
  const [selectedCompany, setSelectedCompany] = useState('')
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
  const [notes, setNotes] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-100600')
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Load full clients + services from DB when dialog opens
  useEffect(() => {
    if (!open) return
    async function load() {
      try {
        const { data: clientData, error: clientError } = await supabase.from('clients').select('id, contact_name, company_name, address, city, parish').order('company_name')
        if (clientData && Array.isArray(clientData)) {
          setClients(clientData)
          setCompanyNames([...new Set(clientData.map(c => String(c.company_name || c.contact_name || '')).filter(Boolean))])
          setContactNames([...new Set(clientData.map(c => String(c.contact_name || '')).filter(Boolean))])
          setAddresses([...new Set(clientData.map(c => [c.address, c.city, c.parish].filter(Boolean).map(v => String(v)).join(', ')).filter(Boolean))])
        } else if (clientError) {
          console.error('[v0] Client fetch error:', clientError)
        }

        const { data: svcData, error: svcError } = await supabase.from('services').select('name, base_price').eq('status', 'active').order('name')
        if (svcData && Array.isArray(svcData)) {
          setServiceOptions(svcData.map(s => ({ name: String(s.name || ''), base_price: Number(s.base_price || 0) })))
          setServiceNames(svcData.map(s => String(s.name || '')).filter(Boolean))
        }

        // Generate next invoice number (start at 100600, increment from last)
        const { data: allInvs } = await supabase.from('invoices').select('invoice_number')
        const START = 100600
        let nextNum = START
        if (allInvs && allInvs.length > 0) {
          const nums = allInvs
            .map((r: any) => parseInt(String(r.invoice_number ?? '').replace(/\D/g, ''), 10))
            .filter((n: number) => !isNaN(n) && n >= START)
          if (nums.length > 0) nextNum = Math.max(...nums) + 1
        }
        setInvoiceNumber(`INV-${nextNum}`)

        const { data: jobData } = await supabase.from('jobs').select('title').not('title', 'is', null)
        const { data: invData } = await supabase.from('invoices').select('title').not('title', 'is', null)
        const { data: quoteData } = await supabase.from('quotations').select('title').not('title', 'is', null)
        const titles = [...new Set([
          ...(jobData || []).map((r: any) => r.title),
          ...(invData || []).map((r: any) => r.title),
          ...(quoteData || []).map((r: any) => r.title)
        ].filter(Boolean))]
        setJobTitles(titles)
      } catch (err) {
        console.error('[v0] Background load failed:', err)
      }
    }
    load()
  }, [open])

  // When client is selected, auto-fill contact, address, TRN and update contact name list
  const handleClientSelect = (val: string) => {
    setSelectedCompany(val)
    const matching = clients.filter(c => c.company_name === val || c.contact_name === val)
    if (matching.length > 0) {
      const first = matching[0]
      setContactPerson(first.contact_name || '')
      const addr = [first.address, first.city, first.parish].filter(Boolean).join(', ')
      setAddress(addr)
      // Note: TRN is not currently in the clients table, so it remains a manual field for now
      setContactNames([...new Set(matching.map(c => c.contact_name).filter(Boolean) as string[])])
    }
  }

  const handleQuickAddSuccess = (newClient: any) => {
    setClients(prev => [...prev, newClient])
    const newName = newClient.company_name || newClient.contact_name || ''
    setCompanyNames(prev => [...new Set([...prev, newName])])
    setContactNames(prev => [...new Set([...prev, newClient.contact_name || ''])])
    const newAddr = [newClient.address, newClient.city, newClient.parish].filter(Boolean).join(', ')
    setAddresses(prev => [...new Set([...prev, newAddr])])
    
    // Auto-select
    setSelectedCompany(newName)
    setContactPerson(newClient.contact_name || '')
    setAddress(newAddr)
    if (newClient.parish) setServiceLocation(newClient.parish)
  }

  const calcTotal = (item: LineItem) => item.quantity * item.unit_price - item.discount
  const totalAmount = lineItems.reduce((s, i) => s + calcTotal(i), 0)

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value }
      updated.total = calcTotal(updated)
      return updated
    }))
  }

  const selectService = (id: string, name: string) => {
    const svc = serviceOptions.find(s => s.name === name)
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, description: name, unit_price: svc?.base_price ?? item.unit_price }
      updated.total = calcTotal(updated)
      return updated
    }))
  }

  const addLine = () => setLineItems(prev => [...prev, { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0, discount: 0, total: 0 }])
  const removeLine = (id: string) => { if (lineItems.length > 1) setLineItems(prev => prev.filter(i => i.id !== id)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not logged in'); setLoading(false); return }

    const clientRecord = clients.find(c => c.company_name === selectedCompany)
    const { data: newInvoice, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      title: serviceDescription,
      client_id: clientRecord?.id || null,
      items: lineItems,
      subtotal: totalAmount,
      tax_rate: 0, tax_amount: 0,
      discount: lineItems.reduce((s, i) => s + i.discount, 0),
      total: totalAmount,
      balance_due: totalAmount,
      status: 'draft',
      issued_date: invoiceDate,
      notes: JSON.stringify({ contact_person: contactPerson, service_location: serviceLocation, address, payment_terms: paymentTerms, po_number: poNumber, trn, notes }),
    }).select('id').single()
    if (error) { toast.error('Failed to create invoice'); setLoading(false); return }
    toast.success('Invoice created')
    setOpen(false)
    setLoading(false)
    router.push(`/admin/invoices/${newInvoice.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a4a] max-w-5xl! w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Row 1: Invoice # + Date + Company */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Invoice #</Label>
              <div className="h-9 flex items-center px-3 rounded-md border border-[#00BCD4] bg-[#00BCD4]/10 text-[#00BCD4] font-bold text-sm">{invoiceNumber}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Invoice Date</Label>
              <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Client / Company</Label>
              <div className="flex gap-1 items-center">
                <Combobox
                  value={selectedCompany}
                  onChange={handleClientSelect}
                  options={companyNames}
                  placeholder="Select or type company..."
                />
                <button type="button" onClick={() => setQuickAddOpen(true)}
                  className="w-7 h-7 rounded-md bg-[#00BCD4] text-white flex items-center justify-center hover:bg-[#00BCD4]/80 shrink-0"
                  title="Add New Client">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => { setSelectedCompany(''); setContactPerson(''); setAddress(''); setTrn('') }}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Contact Person + Service Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Contact Person</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={contactPerson} onChange={setContactPerson} options={contactNames} placeholder="Select or type contact..." />
                <button type="button" onClick={() => setContactPerson('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Service Location</Label>
              <div className="flex gap-1 items-center">
                <Combobox value={serviceLocation} onChange={setServiceLocation}
                  options={['Kingston', 'St. Andrew', 'St. Catherine', 'Portmore', 'Montego Bay', 'Ocho Rios', 'Mandeville']}
                  placeholder="Select location..." />
                <button type="button" onClick={() => setServiceLocation('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Address</Label>
            <div className="flex gap-1 items-center">
              <Combobox value={address} onChange={setAddress} options={addresses} placeholder="Select or type address..." />
              <button type="button" onClick={() => setAddress('')}
                className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Row 4: Payment Terms + PO # + TRN */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
                  {['COD','Net 15','Net 30','Net 60','50% Deposit','7 Days','30 Days'].map(t => (
                    <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">PO Number</Label>
              <div className="flex gap-1 items-center">
                <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO Number" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
                <button type="button" onClick={() => setPoNumber('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">TRN</Label>
              <div className="flex gap-1 items-center">
                <Input value={trn} onChange={e => setTrn(e.target.value)} placeholder="TRN" className="bg-[#2a2a4a] border-[#3a3a5a] text-white flex-1" />
                <button type="button" onClick={() => setTrn('')}
                  className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Description (job title) */}
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Service Description (Job Title)</Label>
            <div className="flex gap-1 items-center">
              <Combobox value={serviceDescription} onChange={setServiceDescription} options={jobTitles} placeholder="Type or select service description..." />
              <button type="button" onClick={() => setServiceDescription('')}
                className="w-7 h-7 rounded-md bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/60 shrink-0">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-[#3a3a5a] rounded-lg overflow-hidden">
            <div className="bg-[#0d0d1f] px-3 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Line Items</span>
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-[#00BCD4] text-xs hover:text-[#00BCD4]/80 font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="bg-[#141428] border-b border-[#3a3a5a]">
                    <th className="text-left text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[40%]">Description</th>
                    <th className="text-center text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[12%]">Qty</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[18%]">Unit Price (JMD)</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[12%]">Discount</th>
                    <th className="text-right text-[10px] text-gray-400 font-semibold uppercase px-3 py-2 w-[12%]">Amount</th>
                    <th className="w-[6%] px-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a4a]">
                  {lineItems.map(item => (
                    <tr key={item.id} className="hover:bg-[#2a2a4a]/50">
                      <td className="px-3 py-2">
                        <Combobox value={item.description}
                          onChange={v => selectService(item.id, v)}
                          options={serviceNames}
                          placeholder="Select or type service..." />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-0.5 justify-center">
                          <button type="button" onClick={() => updateLineItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 rounded bg-red-900/40 text-red-300 flex items-center justify-center hover:bg-red-800">
                            <Minus className="h-3 w-3" />
                          </button>
                          <Input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                            className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-center px-1 w-12" min={1} />
                          <button type="button" onClick={() => updateLineItem(item.id, 'quantity', item.quantity + 1)}
                            className="w-6 h-6 rounded bg-[#00BCD4]/30 text-[#00BCD4] flex items-center justify-center hover:bg-[#00BCD4]/60">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" value={item.unit_price} onChange={e => updateLineItem(item.id, 'unit_price', e.target.value)}
                          className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-right" min={0} />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" value={item.discount} onChange={e => updateLineItem(item.id, 'discount', e.target.value)}
                          className="bg-[#2a2a4a] border-[#3a3a5a] text-white text-right" min={0} />
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-[#FF6B00] text-sm">
                        {calcTotal(item).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeLine(item.id)}
                          className="w-7 h-7 rounded bg-red-900/40 text-red-400 flex items-center justify-center hover:bg-red-900/70 mx-auto">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#0d0d1f] border-t border-[#3a3a5a]">
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-[#00BCD4] text-xs hover:text-[#00BCD4]/80 font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
              <div className="text-[#FF6B00] font-bold">Total: JMD {totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-[#2a2a4a] border-[#3a3a5a] text-white min-h-[60px]" />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[#3a3a5a] text-white hover:bg-[#2a2a4a]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold px-6">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
      <QuickAddClientDialog 
        open={quickAddOpen} 
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />
    </Dialog>
  )
}
