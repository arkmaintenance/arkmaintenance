'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      contact_name: formData.get('contact_name') as string,
      company_name: formData.get('company_name') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      parish: formData.get('parish') as string || null,
      client_type: formData.get('client_type') as string,
      notes: formData.get('notes') as string || null,
    })

    if (error) {
      toast.error('Failed to create client')
      setLoading(false)
      return
    }

    toast.success('Client created successfully')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Client</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the client details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name" className="text-foreground">Contact Name *</Label>
              <Input
                id="contact_name"
                name="contact_name"
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-foreground">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone</Label>
              <Input
                id="phone"
                name="phone"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">Address</Label>
            <Input
              id="address"
              name="address"
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">City</Label>
              <Input
                id="city"
                name="city"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parish" className="text-foreground">Parish</Label>
              <Input
                id="parish"
                name="parish"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_type" className="text-foreground">Client Type</Label>
            <Select name="client_type" defaultValue="residential">
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              className="bg-input border-border text-foreground"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
