'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
}

interface Quotation {
  id: string
  quote_number: string
}

interface AddExpenseDialogProps {
  invoices?: Invoice[]
  quotations?: Quotation[]
}

export function AddExpenseDialog({ invoices = [], quotations = [] }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency] = useState('JMD')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [linkedInvoice, setLinkedInvoice] = useState('')
  const [linkedQuotation, setLinkedQuotation] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { toast.error('Category is required'); return }
    if (!amount) { toast.error('Amount is required'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be logged in'); setLoading(false); return }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      description: description || null,
      amount: parseFloat(amount),
      category,
      date,
      status: 'pending',
      invoice_id: linkedInvoice || null,
      quotation_id: linkedQuotation || null,
    })

    if (error) { toast.error('Failed to create expense'); setLoading(false); return }
    toast.success('Expense added successfully')
    setOpen(false)
    setLoading(false)
    setDescription(''); setAmount(''); setCategory(''); setLinkedInvoice(''); setLinkedQuotation('')
    router.refresh()
  }

  const inputCls = 'bg-[#1e2235] border-[#2d3352] text-white placeholder:text-gray-500 focus-visible:ring-[#FF6B00]/40'
  const labelCls = 'text-gray-400 text-xs uppercase tracking-wide font-medium'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#13172a] border-[#2d3352] max-w-md p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#5c1a1a] via-[#3a1a2a] to-[#FF6B00]/30 px-6 py-4 rounded-t-lg border-b border-[#2d3352]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">Add Expense</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Link to Invoice */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Link to Invoice (optional)</Label>
            <Select value={linkedInvoice} onValueChange={setLinkedInvoice}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select invoice..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                <SelectItem value="" className="text-gray-400">None</SelectItem>
                {invoices.map(inv => (
                  <SelectItem key={inv.id} value={inv.id} className="text-white">
                    {inv.invoice_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to Quotation */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Link to Quotation (optional)</Label>
            <Select value={linkedQuotation} onValueChange={setLinkedQuotation}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select quotation..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                <SelectItem value="" className="text-gray-400">None</SelectItem>
                {quotations.map(q => (
                  <SelectItem key={q.id} value={q.id} className="text-white">
                    {q.quote_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expense description"
              className={inputCls}
            />
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className={labelCls}>Amount *</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Currency</Label>
              <Input
                value={currency}
                readOnly
                className={`${inputCls} cursor-not-allowed opacity-60`}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2235] border-[#2d3352]">
                <SelectItem value="parts" className="text-white">Parts & Supplies</SelectItem>
                <SelectItem value="fuel" className="text-white">Fuel & Transportation</SelectItem>
                <SelectItem value="tools" className="text-white">Tools & Equipment</SelectItem>
                <SelectItem value="office" className="text-white">Office Supplies</SelectItem>
                <SelectItem value="utilities" className="text-white">Utilities</SelectItem>
                <SelectItem value="other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button" variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#2d3352] text-white hover:bg-[#1e2235]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#FF6B00] to-[#c0390a] hover:from-[#FF6B00]/90 hover:to-[#c0390a]/90 text-white font-semibold px-8"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
              ) : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
