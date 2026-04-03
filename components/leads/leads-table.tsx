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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MoreHorizontal, Search, Mail, Phone, Pencil, Trash2, UserPlus } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  source: string | null
  status: string
  estimated_value: number | null
  created_at: string
}

interface LeadsTableProps {
  leads: Lead[]
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  contacted: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
  qualified: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  converted: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
  lost: 'bg-red-500/20 text-red-500 border-red-500/50',
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase()) ||
    lead.company?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete lead')
      return
    }
    toast.success('Lead deleted')
    router.refresh()
  }

  async function handleConvertToClient(lead: Lead) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      contact_name: lead.name,
      company_name: lead.company,
      email: lead.email,
      phone: lead.phone,
      client_type: 'residential',
    })

    if (error) {
      toast.error('Failed to convert lead')
      return
    }

    await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id)
    toast.success('Lead converted to client')
    router.refresh()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No leads found matching your search.' : 'No leads yet. Add your first lead to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Source</TableHead>
                  <TableHead className="text-muted-foreground">Est. Value</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-border hover:bg-secondary/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        {lead.company && (
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground capitalize">{lead.source || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[#00BFFF] font-medium">
                        {lead.estimated_value 
                          ? `$${Number(lead.estimated_value).toLocaleString()}`
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[lead.status] || statusColors.new}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="text-foreground hover:bg-secondary cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {lead.status !== 'converted' && (
                            <DropdownMenuItem
                              className="text-emerald-500 hover:bg-secondary cursor-pointer"
                              onClick={() => handleConvertToClient(lead)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Convert to Client
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-500 hover:bg-secondary cursor-pointer"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
