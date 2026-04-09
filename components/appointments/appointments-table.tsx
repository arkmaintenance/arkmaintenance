'use client'

import { useMemo, useState } from 'react'
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
import { EditAppointmentDialog } from '@/components/appointments/edit-appointment-dialog'
import { toast } from 'sonner'
import { ArrowUpDown, Eye, Pencil, Search, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface AppointmentClient {
  id: string
  contact_name: string
  company_name: string | null
  address?: string
  city?: string
  parish?: string
}

interface AppointmentTechnician {
  id: string
  name: string
}

interface AppointmentRow {
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
  created_at: string
  clients: { contact_name: string; company_name: string | null } | null
  technicians: { name: string } | null
}

interface AppointmentsTableProps {
  appointments: AppointmentRow[]
  clients: AppointmentClient[]
  technicians: AppointmentTechnician[]
}

type SortField = 'title' | 'client' | 'technician' | 'scheduled_date' | 'status'
type SortDir = 'asc' | 'desc'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  scheduled: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  'in-progress': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  completed: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
}

export function AppointmentsTable({ appointments, clients, technicians }: AppointmentsTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('scheduled_date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRow | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) =>
      appointment.title.toLowerCase().includes(search.toLowerCase()) ||
      appointment.clients?.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.technicians?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return [...filtered].sort((left, right) => {
      let leftValue: string | number = ''
      let rightValue: string | number = ''

      if (sortField === 'title') {
        leftValue = left.title
        rightValue = right.title
      }
      if (sortField === 'client') {
        leftValue = left.clients?.company_name || left.clients?.contact_name || ''
        rightValue = right.clients?.company_name || right.clients?.contact_name || ''
      }
      if (sortField === 'technician') {
        leftValue = left.technicians?.name || ''
        rightValue = right.technicians?.name || ''
      }
      if (sortField === 'scheduled_date') {
        leftValue = left.scheduled_date ? new Date(left.scheduled_date).getTime() : 0
        rightValue = right.scheduled_date ? new Date(right.scheduled_date).getTime() : 0
      }
      if (sortField === 'status') {
        leftValue = left.status
        rightValue = right.status
      }

      if (leftValue < rightValue) return sortDir === 'asc' ? -1 : 1
      if (leftValue > rightValue) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [appointments, search, sortDir, sortField])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((current) => current === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortField(field)
    setSortDir('asc')
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) {
      toast.error(error.message || 'Failed to delete appointment')
      return
    }

    toast.success('Appointment deleted')
    router.refresh()
  }

  function SortHead({ field, children }: { field: SortField; children: ReactNode }) {
    return (
      <TableHead
        className="cursor-pointer select-none font-medium text-foreground group"
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {children}
          <ArrowUpDown className={`h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100 ${sortField === field ? 'text-[#00BFFF] opacity-100' : ''}`} />
        </span>
      </TableHead>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border-border bg-input pl-9 text-foreground"
              />
            </div>
            <span className="ml-auto text-sm text-muted-foreground">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {search ? 'No appointments found matching your search.' : 'No appointments yet. Create your first appointment to get started.'}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-gradient-to-r from-[#0f7d8a] via-[#154c79] to-[#1d365f] hover:bg-transparent">
                    <SortHead field="title">Subject</SortHead>
                    <SortHead field="client">Client</SortHead>
                    <SortHead field="technician">Technician</SortHead>
                    <SortHead field="status">Status</SortHead>
                    <SortHead field="scheduled_date">Scheduled</SortHead>
                    <TableHead className="text-right font-medium text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className="cursor-pointer border-border hover:bg-secondary/30"
                      onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                    >
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <span
                          className="cursor-pointer font-medium text-[#00BFFF] hover:underline"
                          onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                        >
                          {appointment.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-[#FF6B00]">
                          {appointment.clients?.company_name || appointment.clients?.contact_name || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {appointment.technicians?.name || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusColors[appointment.status] || statusColors.scheduled} text-xs uppercase font-semibold`}>
                          {appointment.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.scheduled_date ? (
                          <div className="text-sm">
                            <span className="block text-foreground">
                              {new Date(appointment.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {appointment.scheduled_time ? (
                              <span className="text-xs text-muted-foreground">{appointment.scheduled_time}</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingAppointment(appointment)}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(appointment.id)}
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

      <EditAppointmentDialog
        appointment={editingAppointment}
        clients={clients}
        technicians={technicians}
        open={Boolean(editingAppointment)}
        onOpenChange={(open) => {
          if (!open) setEditingAppointment(null)
        }}
      />
    </>
  )
}
