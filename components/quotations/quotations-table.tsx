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
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { downloadQuotationPdf } from '@/lib/client-pdf-download'
import { buildServiceDescription } from '@/lib/service-description'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Eye, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Pencil, 
  Copy, 
  Trash2,
  Download,
  ArrowUpDown,
} from 'lucide-react'

interface Quotation {
  id: string
  quote_number: string
  title: string | null
  description: string | null
  total: number
  status: string
  valid_until: string | null
  clients: { contact_name: string; company_name: string | null } | null
  jobs?: { title: string | null } | null
  created_at: string
}

interface QuotationsTableProps {
  quotations: Quotation[]
}

type SortField = 'quote_number' | 'client' | 'total' | 'created_at'
type SortDir = 'asc' | 'desc'

export function QuotationsTable({ quotations }: QuotationsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const years = [...new Set(quotations.map(q =>
    new Date(q.created_at).getFullYear()
  ))].sort((a, b) => b - a)

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.clients?.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.clients?.company_name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter
    const qYear = new Date(q.created_at).getFullYear().toString()
    const matchesYear = yearFilter === 'all' || qYear === yearFilter
    return matchesSearch && matchesStatus && matchesYear
  })

  const filteredQuotations = [...filtered].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    if (sortField === 'quote_number') { av = a.quote_number; bv = b.quote_number }
    if (sortField === 'client') { av = a.clients?.company_name || a.clients?.contact_name || ''; bv = b.clients?.company_name || b.clients?.contact_name || '' }
    if (sortField === 'total') { av = Number(a.total); bv = Number(b.total) }
    if (sortField === 'created_at') { av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime() }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('quotations').delete().eq('id', id)
    if (error) { toast.error('Failed to delete quotation'); return }
    toast.success('Quotation deleted'); router.refresh()
  }

  async function handleAccept(id: string) {
    const { error } = await supabase
      .from('quotations')
      .update({ status: 'accepted' })
      .eq('id', id)
    if (error) { toast.error('Failed to update quotation'); return }
    toast.success('Quotation accepted'); router.refresh()
  }

  async function handleDownloadPdf(id: string) {
    setDownloadingId(id)

    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          quote_number,
          title,
          description,
          items,
          subtotal,
          total,
          created_at,
          notes,
          payment_terms,
          is_service_contract,
          recurring_schedule,
          scope_template,
          scope_of_work,
          scope_of_work_points,
          clients (
            contact_name,
            company_name,
            address,
            city
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        throw new Error('Failed to load quotation data')
      }

      const items = (typeof data.items === 'string' ? JSON.parse(data.items) : data.items || []).map((item: any) => ({
        description: item.description || '',
        qty: Number(item.qty || item.quantity || 1),
        unit_price: Number(item.unit_price || item.rate || 0),
        discount: Number(item.discount || 0),
        amount: Number(item.amount || 0),
      }))
      let parsedNotes: any = {}
      try { parsedNotes = typeof data.notes === 'string' ? JSON.parse(data.notes) : {} } catch {}

      const subtotal = Number(data.subtotal) || items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)
      const total = Number(data.total) || subtotal
      const serviceDescription = data.title || 'SERVICE QUOTATION'
      const serviceLocation = parsedNotes.service_location || ''
      const serviceDescriptionLabel = buildServiceDescription(serviceDescription, serviceLocation, 'SERVICE QUOTATION')

      const dateStr = new Date(data.created_at).toISOString().split('T')[0]
      const clientName = data.clients?.company_name || data.clients?.contact_name || 'Client'
      const jobDesc = serviceDescriptionLabel
      const safeFileName = `Quote-${data.quote_number}${jobDesc ? `-${jobDesc}` : ''}.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

      await downloadQuotationPdf({
        quote_number: data.quote_number,
        date: new Date(data.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        payment_terms: parsedNotes.payment_terms || 'COD',
        po_number: parsedNotes.po_number || '',
        trn: parsedNotes.trn || '',
        service_description: serviceDescription,
        service_location: serviceLocation,
        timeline: parsedNotes.job_timeline || data.description || '3-5 Days',
        warranty: parsedNotes.warranty || '30 days',
        client: {
          name: data.clients?.contact_name || 'Client',
          company: parsedNotes.client_company || data.clients?.company_name || '',
          address: data.clients?.address || '',
          city: data.clients?.city || '',
        },
        items,
        subtotal,
        total,
        isServiceContract: parsedNotes.is_service_contract || data.is_service_contract,
        recurringSchedule: parsedNotes.recurring_schedule || data.recurring_schedule || 'one-time',
        scopeTemplate: parsedNotes.scope_template || data.scope_template || '',
        scopeOfWork: parsedNotes.scope_of_work || data.scope_of_work || '',
        scopeOfWorkPoints: Array.isArray(parsedNotes.scope_of_work_points)
          ? parsedNotes.scope_of_work_points
          : Array.isArray(data.scope_of_work_points)
            ? data.scope_of_work_points
            : [],
      }, safeFileName)

      toast.success('Quotation PDF downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download quotation PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) setSelectedIds(new Set(filteredQuotations.map(q => q.id)))
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

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quotations..."
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
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
            {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No quotations found matching your search.' : 'No quotations yet. Create your first quotation to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.size === filteredQuotations.length && filteredQuotations.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white/30"
                    />
                  </TableHead>
                  <SortHead field="quote_number">Quotation #</SortHead>
                  <SortHead field="client">Client</SortHead>
                  <SortHead field="total">Amount</SortHead>
                  <TableHead className="text-foreground font-medium">Description</TableHead>
                  <SortHead field="created_at">Date</SortHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((q) => (
                  <TableRow
                    key={q.id}
                    className="border-border hover:bg-secondary/30 cursor-pointer"
                    onClick={() => router.push(`/admin/quotations/${q.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(q.id)}
                        onCheckedChange={(checked) => handleSelectOne(q.id, checked as boolean)}
                        className="border-border"
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <span
                        className="font-medium text-[#FF6B00] hover:underline cursor-pointer"
                        onClick={() => router.push(`/admin/quotations/${q.id}`)}
                      >
                        {q.quote_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-[#00BFFF] font-medium block">
                          {q.clients?.contact_name || '-'}
                        </span>
                        {q.clients?.company_name && (
                          <span className="text-xs text-[#00BFFF]/70 block">{q.clients.company_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        JMD {Number(q.total).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground truncate max-w-[180px] block text-sm">
                        {q.description || q.title || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {new Date(q.created_at).toLocaleDateString('en-US', { 
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
                          onClick={() => router.push(`/admin/quotations/${q.id}`)}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDownloadPdf(q.id)}
                          disabled={downloadingId === q.id}
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-emerald-500 hover:text-emerald-400"
                          onClick={() => handleAccept(q.id)}
                          title="Approve"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/invoices/new?from_quote=${q.id}`)}
                          title="Convert to Invoice"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/calendar?quote=${q.id}`)}
                          title="Schedule"
                        >
                          <Calendar className="h-3.5 w-3.5" />
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
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(q.id)}
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
    </Card>
  )
}
