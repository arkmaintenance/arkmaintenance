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
import { Search, Pencil, Trash2 } from 'lucide-react'

interface Expense {
  id: string
  category: string
  description: string | null
  amount: number
  date: string
  vendor: string | null
  status: string
  invoice_id?: string | null
  quotation_id?: string | null
  created_at: string
}

interface ExpensesTableProps {
  expenses: Expense[]
}

const categoryColors: Record<string, string> = {
  parts: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  fuel: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  tools: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  office: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filteredExpenses = expenses.filter((exp) =>
    exp.category.toLowerCase().includes(search.toLowerCase()) ||
    exp.description?.toLowerCase().includes(search.toLowerCase()) ||
    exp.vendor?.toLowerCase().includes(search.toLowerCase())
  )

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  async function handleDelete(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) { toast.error('Failed to delete expense'); return }
    toast.success('Expense deleted'); router.refresh()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredExpenses.length} item{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
            <span className="text-sm font-semibold text-[#FF6B00]">
              Total: JMD {total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {search ? 'No expenses found matching your search.' : 'No expenses yet. Add your first expense to get started.'}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-[#1a3a5c] via-[#3a2a5c] to-[#5c2a2a]">
                  <TableHead className="text-foreground font-medium">Description</TableHead>
                  <TableHead className="text-foreground font-medium">Category</TableHead>
                  <TableHead className="text-foreground font-medium">Linked To</TableHead>
                  <TableHead className="text-foreground font-medium">Amount</TableHead>
                  <TableHead className="text-foreground font-medium">Date</TableHead>
                  <TableHead className="text-[#FF6B00] font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} className="border-border hover:bg-secondary/30">
                    <TableCell>
                      <div>
                        <span className="text-foreground text-sm">{exp.description || '—'}</span>
                        {exp.vendor && (
                          <span className="text-xs text-muted-foreground block">{exp.vendor}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`uppercase text-xs ${categoryColors[exp.category] || categoryColors.other}`}>
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exp.invoice_id ? (
                        <span className="text-[#FF6B00] text-xs">Invoice</span>
                      ) : exp.quotation_id ? (
                        <span className="text-[#00BFFF] text-xs">Quote</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-[#FF6B00]">
                        JMD {Number(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
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
                          onClick={() => handleDelete(exp.id)}
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
