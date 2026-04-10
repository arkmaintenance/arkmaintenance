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
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { EditClientDialog } from './edit-client-dialog'

interface Client {
  id: string
  contact_name: string
  company_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  parish: string | null
  client_type: string
  status: string
  notes: string | null
  created_at: string
}

interface ClientsTableProps {
  clients: Client[]
}

type SortField = 'contact_name' | 'company_name' | 'email' | 'phone'
type SortDir = 'asc' | 'desc'

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('contact_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const router = useRouter()
  const supabase = createClient()

  const filtered = clients.filter((client) =>
    client.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredClients = [...filtered].sort((a, b) => {
    const av = (a[sortField] || '') as string
    const bv = (b[sortField] || '') as string
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Failed to delete client'); return }
    toast.success('Client deleted'); router.refresh()
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
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <SortHead field="contact_name">Contact</SortHead>
                  <SortHead field="company_name">Company</SortHead>
                  <SortHead field="email">Email</SortHead>
                  <SortHead field="phone">Phone</SortHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-border hover:bg-secondary/30 cursor-pointer"
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <span
                        className="text-[#00BFFF] font-medium hover:underline cursor-pointer"
                        onClick={() => router.push(`/admin/clients/${client.id}`)}
                      >
                        {client.contact_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[#00BFFF]/80 hover:underline cursor-pointer">
                        {client.company_name || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">{client.email || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">{client.phone || '—'}</span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <EditClientDialog client={client as any} />
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(client.id)}
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
