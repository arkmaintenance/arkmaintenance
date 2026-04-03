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

export function AddLeadDialog() {
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

    const { error } = await supabase.from('leads').insert({
      user_id: user.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      company: formData.get('company') as string || null,
      source: formData.get('source') as string || null,
      status: 'new',
      estimated_value: parseFloat(formData.get('estimated_value') as string) || null,
      notes: formData.get('notes') as string || null,
    })

    if (error) {
      toast.error('Failed to create lead')
      setLoading(false)
      return
    }

    toast.success('Lead created successfully')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the lead details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">Company</Label>
              <Input
                id="company"
                name="company"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="text-foreground">Source</Label>
              <Select name="source">
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_value" className="text-foreground">Est. Value ($)</Label>
              <Input
                id="estimated_value"
                name="estimated_value"
                type="number"
                step="0.01"
                min="0"
                className="bg-input border-border text-foreground"
              />
            </div>
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
                'Create Lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
