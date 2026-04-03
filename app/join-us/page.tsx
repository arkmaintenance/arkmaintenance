'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Upload, Send, CheckCircle, X, FileText, Phone, Mail, User } from 'lucide-react'

const skillGroups = [
  {
    label: 'Air Conditioning',
    items: ['Air Conditioner Service, Repair and Install'],
  },
  {
    label: 'Refrigeration',
    items: ['Fridge / Freezer Service and Repairs', 'Ice Machine Service and Repairs'],
  },
  {
    label: 'Kitchen',
    items: ['Kitchen Equipment Repair', 'Kitchen Equipment Deep Cleaning'],
  },
  {
    label: 'Exhaust & Ducting',
    items: ['Exhaust System Service, Repair and Install', 'Air Duct Repairs', 'Air Duct Installation'],
  },
  {
    label: 'General',
    items: ['Electrician', 'Plumber', 'General Maintenance', 'Other'],
  },
]

const skillOptions = skillGroups.flatMap(g => g.items)

export default function JoinUsPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', skills: [] as string[], message: '' })
  const [resume, setResume] = useState<File | null>(null)
  const [mathAnswer, setMathAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setResume(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) { toast.error('Please fill in all required fields'); return }
    if (mathAnswer !== '20') { toast.error('Security check failed. 12 + 8 = 20'); return }
    setSending(true)
    try {
      const response = await fetch('/api/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, skills: formData.skills.join(', ') }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', skills: [], message: '' })
      setMathAnswer('')
      setResume(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen font-sans">
      <WebsiteNav activePage="join-us" />

      {/* Success modal overlay */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full text-center bg-[#111] border border-[#f97316]/40 rounded-2xl p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#f97316]/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-[#f97316]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Application Submitted!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">Thank you for your interest in joining ARK Maintenance. We will review your application and get back to you soon.</p>
            <Link href="/" className="inline-block bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-10 py-3 rounded-lg transition-colors text-sm uppercase tracking-widest">Go Home</Link>
            <button onClick={() => setSubmitted(false)} className="block mx-auto mt-4 text-white/40 hover:text-white/70 text-sm transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Full-bleed background image — fixed behind all content */}
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOR%20JOIN-US%20PAGE-X7DiBT9tZNZYp6Q9DUOWGqaHDvlJgI.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 pt-20 pb-24 px-4">
          {/* Page heading */}
          <div className="text-center mb-10">
            <p className="text-[#f97316] text-sm font-bold uppercase tracking-widest mb-3">Join Our Team</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Become a Part Time Technician</h1>
            <p className="text-white/70 text-base max-w-2xl mx-auto">We&apos;re always looking for skilled part-time technicians to join our growing team. Fill out the form below to apply.</p>
          </div>

          {/* Form card */}
          <div className="max-w-[860px] mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-4 border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#f97316]" /> Personal Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 block">Full Name <span className="text-[#f97316]">*</span></label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#f97316]" /> Email Address
                    </label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[13px] font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#f97316]" /> Phone Number <span className="text-[#f97316]">*</span>
                    </label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="1876-XXX-XXXX" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-4 border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-6">Your Skills</h2>
                <div className="space-y-5">
                  {skillGroups.map(group => (
                    <div key={group.label}>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#f97316]/70 mb-2">{group.label}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map(skill => {
                          const selected = formData.skills.includes(skill)
                          return (
                            <label key={skill} className={`flex items-center gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-all ${selected ? 'border-[#f97316] bg-[#f97316]/10 text-[#f97316]' : 'border-white/10 bg-white/5 text-white/60 hover:border-[#f97316]/50 hover:text-[#f97316]'}`}>
                              <input type="checkbox" checked={selected} onChange={() => toggleSkill(skill)} className="hidden" />
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-[#f97316] bg-[#f97316]' : 'border-white/30'}`}>
                                {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </span>
                              <span className="text-[13px] font-medium leading-snug">{skill}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message + resume + security */}
              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-6 border border-white/10 shadow-2xl">
                <div className="mb-5">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Additional Information</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your experience, availability, which parishes you can work in, etc." rows={4} className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm resize-none" />
                </div>

                <div className="mb-5">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Resume / CV (optional)</label>
                  <div className="border-2 border-dashed border-[#f97316]/40 hover:border-[#f97316] rounded-xl p-5 text-center transition-colors bg-black/30">
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                    {resume ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-7 w-7 text-[#f97316]" />
                        <div className="text-left">
                          <p className="font-medium text-sm text-white">{resume.name}</p>
                          <p className="text-xs text-white/50">{(resume.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => setResume(null)} className="text-red-400 hover:text-red-300 p-1"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-7 w-7 mx-auto text-white/30 mb-2" />
                        <button type="button" onClick={() => fileRef.current?.click()} className="border border-[#f97316]/50 text-[#f97316] px-5 py-2 rounded text-sm hover:bg-[#f97316]/10 transition-colors">Choose File</button>
                        <p className="text-xs text-white/40 mt-2">PDF, DOC, DOCX — max 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Security Check <span className="text-[#f97316]">*</span> — What is 12 + 8?</label>
                  <input type="number" min="0" max="99" value={mathAnswer} onChange={e => setMathAnswer(e.target.value)} placeholder="Answer" required className="w-40 bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                </div>

                <button type="submit" disabled={sending} className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  {sending ? <><Spinner className="h-4 w-4" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <WebsiteFooter />
    </div>
  )
}
