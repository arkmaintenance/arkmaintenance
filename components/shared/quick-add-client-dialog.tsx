'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface QuickAddClientDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSuccess: (client: any) => void
}

export function QuickAddClientDialog({ open, onOpenChange, onSuccess }: QuickAddClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const contact_name = formData.get('contact_name') as string
    const company_name = formData.get('company_name') as string || null
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const address = formData.get('address') as string || null
    const city = formData.get('city') as string || null
    const parish = formData.get('parish') as string || null
    const client_type = formData.get('client_type') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not logged in')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from('clients').insert({
      user_id: user.id,
      contact_name,
      company_name,
      email,
      phone,
      address,
      city,
      parish,
      client_type,
    }).select().single()

    if (error) {
      toast.error('Failed to create client')
      setLoading(false)
      return
    }

    toast.success('Client created successfully')
    setLoading(false)
    onSuccess(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a4a] text-white">
        <DialogHeader>
          <DialogTitle>Quick Add Client</DialogTitle>
          <DialogDescription className="text-gray-400">Add a new client record quickly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Contact Name *</Label>
              <Input name="contact_name" required className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Company Name</Label>
              <Input name="company_name" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Email</Label>
              <Input name="email" type="email" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Phone</Label>
              <Input name="phone" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Address</Label>
            <Input name="address" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">City</Label>
              <Input name="city" className="bg-[#2a2a4a] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Parish</Label>
              <Input
                name="parish"
                placeholder="Enter parish"
                className="bg-[#2a2a4a] border-[#3a3a 5a] text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Client Type</Label>
            <Select name="client_type" defaultValue="commercial">
              <SelectTrigger className="bg-[#2a2a4a] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#3a3a5a] text-white hover:bg-[#2a2a4a]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#00BCD4] text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : 'Create & Select'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
