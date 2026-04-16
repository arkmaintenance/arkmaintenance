'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface QuickAddTechnicianResult {
  id: string
  name: string
  phone: string | null
  specialization: string | null
}

interface QuickAddTechnicianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (technician: QuickAddTechnicianResult) => void
}

export function QuickAddTechnicianDialog({
  open,
  onOpenChange,
  onSuccess,
}: QuickAddTechnicianDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [notes, setNotes] = useState('')
  const supabase = createClient()

  function resetForm() {
    setName('')
    setPhone('')
    setSpecialization('')
    setNotes('')
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !loading) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      toast.error('Technician name is required')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not logged in')
      setLoading(false)
      return
    }

    const normalizedSpecialization = specialization.trim()
    const { data, error } = await supabase
      .from('technicians')
      .insert({
        user_id: user.id,
        name: name.trim(),
        email: null,
        phone: phone.trim() || null,
        specialization: normalizedSpecialization
          ? normalizedSpecialization.toLowerCase().replace(/\s+/g, '-')
          : null,
        hourly_rate: 0,
        status: 'active',
        notes: JSON.stringify({
          quick_add: true,
          specializations: normalizedSpecialization ? [normalizedSpecialization] : [],
          notes: notes.trim(),
        }),
      })
      .select('id, name, phone, specialization')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'Failed to create technician')
      setLoading(false)
      return
    }

    toast.success('Technician created successfully')
    onSuccess(data as QuickAddTechnicianResult)
    resetForm()
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#2d3352] bg-[#13172a] text-white">
        <DialogHeader>
          <DialogTitle>Quick Add Technician</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a technician without leaving this form.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-gray-400">Name *</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Technician name"
              className="border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-400">Phone</Label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone / WhatsApp"
                className="border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-gray-400">Specialization</Label>
              <Input
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                placeholder="HVAC, Refrigeration..."
                className="border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-gray-400">Notes</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
              className="min-h-[90px] border-[#2d3352] bg-[#1e2235] text-white placeholder:text-gray-500"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-[#2d3352] text-white hover:bg-[#1e2235]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#00BCD4] text-white hover:bg-[#00BCD4]/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create & Select'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
