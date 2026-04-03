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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Eye, Pencil, Trash2, ArrowUpDown, RefreshCw } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string | null
  job_type: string
  status: string
  priority: string
  scheduled_date: string | null
  scheduled_time: string | null
  address: string | null
  is_recurring?: boolean
  recurring_frequency?: string | null
  clients: { contact_name: string; company_name: string | null } | null
  technicians: { name: string } | null
  created_at: string
}

interface JobsTableProps {
  jobs: Job[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
  scheduled: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/50',
  'in-progress': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  completed: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
}

type SortField = 'title' | 'client' | 'technician' | 'scheduled_date' | 'status'
type SortDir = 'asc' | 'desc'

export function JobsTable({ jobs }: JobsTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('scheduled_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const router = useRouter()
  const supabase = createClient()

  const filtered = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.clients?.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.technicians?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredJobs = [...filtered].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    if (sortField === 'title') { av = a.title; bv = b.title }
    if (sortField === 'client') { av = a.clients?.company_name || a.clients?.contact_name || ''; bv = b.clients?.company_name || b.clients?.contact_name || '' }
    if (sortField === 'technician') { av = a.technicians?.name || ''; bv = b.technicians?.name || '' }
    if (sortField === 'scheduled_date') { av = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0; bv = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0 }
    if (sortField === 'status') { av = a.status; bv = b.status }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) { toast.error('Failed to delete job'); return }
    toast.success('Job deleted'); router.refresh()
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
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No jobs found matching your search.' : 'No jobs yet. Create your first job to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <SortHead field="title">Title</SortHead>
                  <SortHead field="client">Client</SortHead>
                  <SortHead field="technician">Technician</SortHead>
                  <SortHead field="status">Status</SortHead>
                  <SortHead field="scheduled_date">Scheduled</SortHead>
                  <TableHead className="text-foreground font-medium">Recurring</TableHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="border-border hover:bg-secondary/30 cursor-pointer"
                    onClick={() => router.push(`/admin/jobs/${job.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <span
                        className="text-[#00BFFF] font-medium hover:underline cursor-pointer"
                        onClick={() => router.push(`/admin/jobs/${job.id}`)}
                      >
                        {job.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[#FF6B00] font-medium text-sm">
                        {job.clients?.company_name || job.clients?.contact_name || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">{job.technicians?.name || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[job.status] || statusColors.pending} uppercase text-xs font-semibold`}>
                        {job.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.scheduled_date ? (
                        <div className="text-sm">
                          <span className="text-foreground block">
                            {new Date(job.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {job.scheduled_time && (
                            <span className="text-muted-foreground text-xs">{job.scheduled_time}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.is_recurring && job.recurring_frequency && job.recurring_frequency !== 'one-time' ? (
                        <div className="flex items-center gap-1 text-teal-400 text-xs">
                          <RefreshCw className="h-3 w-3" />
                          <span className="capitalize">{job.recurring_frequency}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/admin/jobs/${job.id}`)}
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
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
                          onClick={() => handleDelete(job.id)}
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
