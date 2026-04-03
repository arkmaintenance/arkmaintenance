'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Loader2, Wrench, X } from 'lucide-react'

const COMMON_SPECIALIZATIONS = ['HVAC', 'Refrigeration', 'Kitchen Equipment', 'Electrical', 'General Maintenance', 'Plumbing', 'Air Conditioning']

export function AddTechnicianDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [phones, setPhones] = useState([''])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [specializationInput, setSpecializationInput] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function addPhone() {
    setPhones(prev => [...prev, ''])
  }

  function updatePhone(index: number, value: string) {
    setPhones(prev => prev.map((p, i) => i === index ? value : p))
  }

  function removePhone(index: number) {
    if (phones.length > 1) setPhones(prev => prev.filter((_, i) => i !== index))
  }

  function addSpecialization(spec: string) {
    const trimmed = spec.trim()
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations(prev => [...prev, trimmed])
    }
    setSpecializationInput('')
  }

  function removeSpecialization(spec: string) {
    setSpecializations(prev => prev.filter(s => s !== spec))
  }

  function handleSpecializationKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSpecialization(specializationInput)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) { toast.error('Name is required'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('You must be logged in'); setLoading(false); return }

    const primaryPhone = phones.filter(Boolean)[0] || null
    const primarySpec = specializations[0]?.toLowerCase().replace(' ', '-') || null

    const { error } = await supabase.from('technicians').insert({
      user_id: user.id,
      name,
      email: null,
      phone: primaryPhone,
      specialization: primarySpec,
      hourly_rate: 0,
      status: 'active',
      notes: JSON.stringify({ phones: phones.filter(Boolean), specializations, notes }),
    })

    if (error) { toast.error('Failed to create technician'); setLoading(false); return }
    toast.success('Technician created successfully')
    setOpen(false)
    setLoading(false)
    setName(''); setPhones(['']); setSpecializations([]); setNotes('')
    router.refresh()
  }

  const inputCls = 'bg-[#1e2235] border-[#2d3352] text-white placeholder:text-gray-500 focus-visible:ring-[#00BFFF]/40'
  const labelCls = 'text-gray-400 text-xs uppercase tracking-wide font-medium'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Technician
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#13172a] border-[#2d3352] max-w-md p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#00BFFF]/20 via-[#0a1a3a] to-[#00BFFF]/10 px-6 py-4 rounded-t-lg border-b border-[#2d3352]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#00BFFF]" />
              Add Technician
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={inputCls}
              required
            />
          </div>

          {/* Phone / WhatsApp */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Phone / WhatsApp Number(s)</Label>
            <div className="space-y-2">
              {phones.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={phone}
                    onChange={(e) => updatePhone(index, e.target.value)}
                    placeholder={index === 0 ? 'Primary phone number' : 'Additional number'}
                    className={`${inputCls} flex-1`}
                  />
                  {phones.length > 1 && (
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="h-10 w-10 text-gray-500 hover:text-red-500"
                      onClick={() => removePhone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {index === phones.length - 1 && (
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="h-10 w-10 text-[#00BFFF] hover:text-[#00BFFF]/80"
                      onClick={addPhone}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Specialty (type and press Enter)</Label>
            <Input
              value={specializationInput}
              onChange={(e) => setSpecializationInput(e.target.value)}
              onKeyDown={handleSpecializationKeyDown}
              placeholder="Type specialty and press Enter..."
              className={inputCls}
            />
            {/* Common suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {COMMON_SPECIALIZATIONS.filter(s => !specializations.includes(s)).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSpecialization(s)}
                  className="text-xs px-2 py-0.5 rounded border border-[#2d3352] text-gray-400 hover:border-[#00BFFF]/50 hover:text-[#00BFFF] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {specializations.map(spec => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/30 pr-1 flex items-center gap-1"
                  >
                    {spec}
                    <button type="button" onClick={() => removeSpecialization(spec)} className="hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className={`${inputCls} min-h-[72px]`}
              rows={3}
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
              className="bg-gradient-to-r from-[#00BFFF] to-[#0090c0] hover:from-[#00BFFF]/90 hover:to-[#0090c0]/90 text-black font-semibold px-8"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
              ) : 'Add Technician'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
