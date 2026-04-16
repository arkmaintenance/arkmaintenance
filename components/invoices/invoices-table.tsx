'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog'
import { downloadInvoicePdf } from '@/lib/client-pdf-download'
import { getInvoiceJobSubject } from '@/lib/invoice-job-subject'
import { buildServiceDescription } from '@/lib/service-description'
import { 
  Search, 
  Eye,
  Download,
  Pencil, 
  Copy, 
  Trash2,
  Mail,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  title: string | null
  description: string | null
  total: number
  balance_due: number
  status: string
  due_date: string | null
  issued_date: string | null
  amount_paid: number
  clients: { contact_name: string; company_name: string | null; address?: string | null } | null
  jobs?: { title: string | null } | null
  created_at: string
}

interface InvoicesTableProps {
  invoices: Invoice[]
}

type SortField = 'invoice_number' | 'client' | 'total' | 'amount_paid' | 'issued_date'
type SortDir = 'asc' | 'desc'

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('issued_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [emailDialogInvoice, setEmailDialogInvoice] = useState<Invoice | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const years = [...new Set(invoices.map(inv => 
    new Date(inv.issued_date || inv.created_at).getFullYear()
  ))].sort((a, b) => b - a)

  const filtered = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.title?.toLowerCase().includes(search.toLowerCase()) ||
      inv.clients?.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.clients?.company_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const invYear = new Date(inv.issued_date || inv.created_at).getFullYear().toString()
    const matchesYear = yearFilter === 'all' || invYear === yearFilter
    return matchesSearch && matchesStatus && matchesYear
  })

  const filteredInvoices = [...filtered].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    if (sortField === 'invoice_number') { av = a.invoice_number; bv = b.invoice_number }
    if (sortField === 'client') { av = a.clients?.company_name || a.clients?.contact_name || ''; bv = b.clients?.company_name || b.clients?.contact_name || '' }
    if (sortField === 'total') { av = Number(a.total); bv = Number(b.total) }
    if (sortField === 'amount_paid') { av = Number(a.amount_paid); bv = Number(b.amount_paid) }
    if (sortField === 'issued_date') { av = new Date(a.issued_date || a.created_at).getTime(); bv = new Date(b.issued_date || b.created_at).getTime() }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) { toast.error('Failed to delete invoice'); return }
    toast.success('Invoice deleted'); router.refresh()
  }

  async function handleMarkPaid(id: string, total: number) {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', amount_paid: total, balance_due: 0 })
      .eq('id', id)
    if (error) { toast.error('Failed to update invoice'); return }
    toast.success('Invoice marked as paid'); router.refresh()
  }

  async function handleDownloadPdf(id: string) {
    setDownloadingId(id)

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          invoice_number,
          title,
          items,
          subtotal,
          total,
          balance_due,
          issued_date,
          created_at,
          notes,
          clients (
            contact_name,
            company_name,
            address,
            city,
            parish
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        throw new Error('Failed to load invoice data')
      }

      const items = (typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []).map((item: any) => ({
        description: item.description || '',
        qty: Number(item.qty || item.quantity || 1),
        unit_price: Number(item.unit_price || item.rate || 0),
        amount: Number(item.amount || 0),
      }))
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}

      const subtotal = Number(data.subtotal) || items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)
      const total = Number(data.total) || subtotal
      const balanceDue = Number(data.balance_due) || total
      const serviceDescription = getInvoiceJobSubject(data.title, {
        invoiceNumber: data.invoice_number,
        clientName: data.clients?.contact_name,
        companyName: data.clients?.company_name,
      })
      const serviceLocation = parsedNotes.service_location || ''
      const serviceDescriptionLabel = buildServiceDescription(
        serviceDescription,
        serviceLocation,
        'AIR CONDITIONER SERVICING AND MAINTENANCE',
      )

      const dateStr = new Date(data.issued_date || data.created_at).toISOString().split('T')[0]
      const clientName = data.clients?.company_name || data.clients?.contact_name || 'Client'
      const jobDesc = serviceDescriptionLabel
      const safeFileName = `${data.invoice_number} - ${clientName}${jobDesc ? ` - ${jobDesc}` : ''} - ${dateStr}.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

      await downloadInvoicePdf({
        invoice_number: data.invoice_number,
        date: new Date(data.issued_date || data.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        payment_terms: 'COD',
        service_description: serviceDescription,
        service_location: serviceLocation,
        client: {
          name: data.clients?.contact_name || 'Client',
          company: data.clients?.company_name || '',
          address: data.clients?.address || '',
          city: data.clients?.city || '',
          parish: data.clients?.parish || '',
        },
        items,
        subtotal,
        total,
        balance_due: balanceDue,
      }, safeFileName)

      toast.success('Invoice PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) setSelectedIds(new Set(filteredInvoices.map(inv => inv.id)))
    else setSelectedIds(new Set())
  }

  function handleSelectOne(id: string, checked: boolean) {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id); else newSet.delete(id)
    setSelectedIds(newSet)
  }

  function SortHead({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <TableHead
        className="text-foreground font-medium cursor-pointer select-none group"
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          <ArrowUpDown className={`h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity ${sortField === field ? 'opacity-100 text-[#00BFFF]' : ''}`} />
        </span>
      </TableHead>
    )
  }

  const emailInvoiceData = emailDialogInvoice ? {
    invoice_number: emailDialogInvoice.invoice_number,
    date: new Date(emailDialogInvoice.issued_date || emailDialogInvoice.created_at).toLocaleDateString(),
    payment_terms: '30 days',
    service_description: emailDialogInvoice.description || '',
    client: {
      name: emailDialogInvoice.clients?.contact_name || '',
      company: emailDialogInvoice.clients?.company_name || '',
      address: emailDialogInvoice.clients?.address || '',
      city: '',
      parish: '',
      email: undefined,
    },
    items: [],
    subtotal: Number(emailDialogInvoice.total),
    total: Number(emailDialogInvoice.total),
    balance_due: Number(emailDialogInvoice.balance_due),
  } : null

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-input border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px] bg-input border-border">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No invoices found matching your search.' : 'No invoices yet. Create your first invoice to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white/30"
                    />
                  </TableHead>
                  <SortHead field="invoice_number">Invoice #</SortHead>
                  <SortHead field="client">Client</SortHead>
                  <TableHead className="text-foreground font-medium">Description</TableHead>
                  <SortHead field="total">Total</SortHead>
                  <SortHead field="amount_paid">Paid</SortHead>
                  <SortHead field="issued_date">Date</SortHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="border-border hover:bg-secondary/30 cursor-pointer"
                    onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(inv.id)}
                        onCheckedChange={(checked) => handleSelectOne(inv.id, checked as boolean)}
                        className="border-border"
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <span
                        className="font-medium text-[#FF6B00] hover:underline cursor-pointer"
                        onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                      >
                        {inv.invoice_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-[#00BFFF] font-medium block">
                          {inv.clients?.contact_name || '-'}
                        </span>
                        {inv.clients?.company_name && (
                          <span className="text-xs text-[#00BFFF]/70 block">{inv.clients.company_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground truncate max-w-[180px] block text-sm">
                        {inv.description || inv.title || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        JMD {Number(inv.total).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inv.status === 'paid' ? (
                        <span className="font-medium text-emerald-500">
                          JMD {Number(inv.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      ) : inv.status === 'partial' ? (
                        <span className="font-medium text-yellow-400">
                          JMD {Number(inv.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">JMD 0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {new Date(inv.issued_date || inv.created_at).toLocaleDateString('en-US', { 
                          month: 'numeric', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDownloadPdf(inv.id)}
                          disabled={downloadingId === inv.id}
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-blue-400 hover:text-blue-300"
                          onClick={() => setEmailDialogInvoice(inv)}
                          title="Email Invoice"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-emerald-500 hover:text-emerald-400"
                          onClick={() => handleMarkPaid(inv.id, inv.total)}
                          title="Mark as Paid"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(inv.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {emailDialogInvoice && emailInvoiceData && (
        <SendInvoiceDialog
          open={!!emailDialogInvoice}
          onOpenChange={(open) => { if (!open) setEmailDialogInvoice(null) }}
          invoiceData={emailInvoiceData}
          clientEmail={undefined}
        />
      )}
    </Card>
  )
}
