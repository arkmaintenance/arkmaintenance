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
import { Search, Eye, Pencil, Trash2, Phone, MessageCircle } from 'lucide-react'

interface Technician {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialization: string | null
  hourly_rate: number
  status: string
  created_at: string
}

interface TechniciansTableProps {
  technicians: Technician[]
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  'on-leave': 'bg-amber-500/20 text-amber-500 border-amber-500/50',
}

const specializationColors: Record<string, string> = {
  hvac: 'bg-[#00BFFF]/20 text-[#00BFFF] border-[#00BFFF]/40',
  refrigeration: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  kitchen: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  electrical: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  general: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
}

export function TechniciansTable({ technicians }: TechniciansTableProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filteredTechnicians = technicians.filter((tech) =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    tech.email?.toLowerCase().includes(search.toLowerCase()) ||
    tech.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    const { error } = await supabase.from('technicians').delete().eq('id', id)
    if (error) { toast.error('Failed to delete technician'); return }
    toast.success('Technician deleted'); router.refresh()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search technicians..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredTechnicians.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No technicians found matching your search.' : 'No technicians yet. Add your first technician to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <TableHead className="text-foreground font-medium">Name</TableHead>
                  <TableHead className="text-foreground font-medium">Phone / WhatsApp</TableHead>
                  <TableHead className="text-foreground font-medium">Specialty</TableHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechnicians.map((tech) => (
                  <TableRow key={tech.id} className="border-border hover:bg-secondary/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{tech.name}</p>
                        {tech.email && (
                          <p className="text-xs text-muted-foreground">{tech.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tech.phone ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-[#00BFFF]" />
                            {tech.phone}
                          </div>
                          <a
                            href={`https://wa.me/${tech.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WA
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tech.specialization ? (
                        <Badge
                          variant="outline"
                          className={`uppercase text-xs ${specializationColors[tech.specialization.toLowerCase()] || specializationColors.general}`}
                        >
                          {tech.specialization}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                          onClick={() => handleDelete(tech.id)}
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
