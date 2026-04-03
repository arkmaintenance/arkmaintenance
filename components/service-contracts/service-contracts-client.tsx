'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Eye, Download, Copy, Pencil, Trash2, Plus, RefreshCw, DollarSign, FileCheck } from 'lucide-react'

interface Contract {
  id: string
  contract_number: string
  title: string | null
  description: string | null
  status: string
  amount: number
  billing_frequency: string | null
  start_date: string | null
  end_date: string | null
  clients: { contact_name: string; company_name: string | null } | null
  created_at: string
}

interface ServiceContractsClientProps {
  contracts: Contract[]
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  pending: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  expired: 'bg-red-500/20 text-red-400 border-red-500/50',
  cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
}

const FILTER_TABS = ['All', 'Active', 'Pending', 'Completed', 'Expired', 'Cancelled']

export function ServiceContractsClient({ contracts }: ServiceContractsClientProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const router = useRouter()
  const supabase = createClient()

  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === 'active').length
  const totalValue = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + Number(c.amount || 0), 0)

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contract_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.clients?.contact_name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  async function handleDelete(id: string) {
    const { error } = await supabase.from('service_contracts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete contract'); return }
    toast.success('Contract deleted'); router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card border border-teal-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Contracts</p>
            <p className="text-3xl font-bold text-teal-400">{totalContracts}</p>
          </div>
          <div className="rounded-xl bg-teal-400/10 p-3">
            <FileCheck className="h-6 w-6 text-teal-400" />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-card border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Active Contracts</p>
            <p className="text-3xl font-bold text-emerald-500">{activeContracts}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <RefreshCw className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-card border border-[#FF6B00]/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Value</p>
            <p className="text-3xl font-bold text-[#FF6B00]">
              JMD {totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-xl bg-[#FF6B00]/10 p-3">
            <DollarSign className="h-6 w-6 text-[#FF6B00]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs + Search + New Button */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-secondary/40 rounded-lg p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-[#00BFFF] text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border text-foreground"
          />
        </div>
        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filteredContracts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? 'No contracts found matching your search.' : 'No contracts yet.'}
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                    <TableHead className="text-foreground font-medium">Contract #</TableHead>
                    <TableHead className="text-foreground font-medium">Client</TableHead>
                    <TableHead className="text-foreground font-medium">Description</TableHead>
                    <TableHead className="text-foreground font-medium">Schedule</TableHead>
                    <TableHead className="text-foreground font-medium">Amount</TableHead>
                    <TableHead className="text-foreground font-medium">Status</TableHead>
                    <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="border-border hover:bg-secondary/30 cursor-pointer"
                      onClick={() => router.push(`/admin/service-contracts/${contract.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <span
                          className="font-medium text-[#00BFFF] hover:underline cursor-pointer"
                          onClick={() => router.push(`/admin/service-contracts/${contract.id}`)}
                        >
                          {contract.contract_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-foreground font-medium text-sm block">
                            {contract.clients?.company_name || contract.clients?.contact_name || '—'}
                          </span>
                          {contract.clients?.company_name && contract.clients?.contact_name && (
                            <span className="text-xs text-muted-foreground">{contract.clients.contact_name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm truncate max-w-[180px] block">
                          {contract.title || contract.description || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm capitalize">
                          {contract.billing_frequency || 'monthly'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">
                          JMD {Number(contract.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`uppercase text-xs font-semibold ${statusColors[contract.status] || statusColors.pending}`}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/admin/service-contracts/${contract.id}`)}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
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
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(contract.id)}
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
    </div>
  )
}
