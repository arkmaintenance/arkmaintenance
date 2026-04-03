'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Upload, Send, CheckCircle, X, FileText, Phone, Mail, MapPin, User, Building2, PhoneCall } from 'lucide-react'

const serviceGroups = [
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
    items: ['Kitchen Equipment Repair', 'Kitchen Equipment Deep Cleaning', 'Kitchen Exhaust Systems'],
  },
  {
    label: 'Exhaust & Ducting',
    items: ['Exhaust System Service, Repair and Install', 'Air Duct Repairs', 'Air Duct Installation'],
  },
  {
    label: 'Other',
    items: ['Electrical Services', 'Service Contract', 'Other'],
  },
]

const serviceOptions = serviceGroups.flatMap(g => g.items)

export default function GetQuotePage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', message: '', services: [] as string[],
  })
  const [files, setFiles] = useState<File[]>([])
  const [mathAnswer, setMathAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleService = (svc: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(svc) ? prev.services.filter(s => s !== svc) : [...prev.services, svc],
    }))
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (files.length + selected.length > 5) { toast.error('Maximum 5 files'); return }
    setFiles(prev => [...prev, ...selected])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) { toast.error('Please fill in all required fields'); return }
    if (mathAnswer !== '20') { toast.error('Security check failed. 12 + 8 = 20'); return }
    setSending(true)
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          services: formData.services,
          message: formData.message,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send')
      setFormData({ name: '', email: '', phone: '', company: '', message: '', services: [] })
      setMathAnswer('')
      setFiles([])
      setSubmitted(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen font-sans">
      <WebsiteNav activePage="get-quote" />

      {/* Success modal overlay */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full text-center bg-[#111] border border-[#f97316]/40 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-[#f97316]/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-[#f97316]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Quote Request Sent!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">Thank you! We&apos;ll review your request and get back to you with a detailed quote within 24 hours.</p>
            <Link href="/" className="inline-block bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-10 py-3 rounded-lg transition-colors text-sm uppercase tracking-widest">Go Home</Link>
            <button onClick={() => setSubmitted(false)} className="block mx-auto mt-4 text-white/40 hover:text-white/70 text-sm transition-colors">Close</button>
          </div>
        </div>
      )}

      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOR%20GET%20QUOTE%20PAGE-TauNnEL0kpb5dXhmm88C2fucMeluQA.png" alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 pt-20 pb-24 px-4">
          <div className="text-center mb-10">
            <p className="text-[#f97316] text-sm font-bold uppercase tracking-widest mb-3">Free Assessment</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get a Quote</h1>
            <p className="text-white/70 text-base max-w-xl mx-auto">Fill out the form below and our team will provide you with a detailed quote within 24 hours.</p>
          </div>

          <div className="max-w-[860px] mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-4 border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#f97316]" /> Personal Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-white mb-2"><User className="h-3.5 w-3.5 text-[#f97316]" /> Full Name <span className="text-[#f97316]">*</span></label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-white mb-2"><Building2 className="h-3.5 w-3.5 text-[#f97316]" /> Company Name</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Company name (optional)" className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-white mb-2"><Mail className="h-3.5 w-3.5 text-[#f97316]" /> Email Address <span className="text-[#f97316]">*</span></label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-white mb-2"><PhoneCall className="h-3.5 w-3.5 text-[#f97316]" /> Phone Number <span className="text-[#f97316]">*</span></label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="1876-XXX-XXXX" className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-4 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6">Services Required</h2>
                <div className="space-y-5">
                  {serviceGroups.map(group => (
                    <div key={group.label}>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#f97316]/70 mb-2">{group.label}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map(svc => {
                          const selected = formData.services.includes(svc)
                          return (
                            <label key={svc} className={`flex items-center gap-3 cursor-pointer rounded-lg px-4 py-3 border transition-all ${selected ? 'border-[#f97316] bg-[#f97316]/10 text-[#f97316]' : 'border-white/10 bg-white/5 text-white/60 hover:border-[#f97316]/50 hover:text-[#f97316]'}`}>
                              <input type="checkbox" checked={selected} onChange={() => toggleService(svc)} className="hidden" />
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-[#f97316] bg-[#f97316]' : 'border-white/30'}`}>
                                {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </span>
                              <span className="text-[13px] font-medium leading-snug">{svc}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-6 border border-white/10 shadow-2xl">
                <div className="mb-5">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Message / Description</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Describe your needs, equipment details, location, etc." rows={4} className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm resize-none" />
                </div>

                <div className="mb-5">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Attach Files (max 5)</label>
                  <div className="border-2 border-dashed border-[#f97316]/40 hover:border-[#f97316] rounded-xl p-5 text-center transition-colors bg-black/30">
                    <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFiles} className="hidden" />
                    {files.length > 0 ? (
                      <div className="space-y-2 text-left">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-1.5">
                            <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-[#f97316]" /><span className="text-white/80 text-xs truncate">{f.name}</span></div>
                            <button type="button" onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 ml-2"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                        {files.length < 5 && <button type="button" onClick={() => fileRef.current?.click()} className="text-[#f97316] text-xs hover:underline mt-1 block">+ Add more</button>}
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto text-white/30 mb-2" />
                        <button type="button" onClick={() => fileRef.current?.click()} className="border border-[#f97316]/50 text-[#f97316] px-5 py-2 rounded text-sm hover:bg-[#f97316]/10 transition-colors">Choose Files</button>
                        <p className="text-xs text-white/40 mt-2">Images, PDF — up to 5 files</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[13px] font-semibold text-white mb-2 block">Security Check <span className="text-[#f97316]">*</span> — What is 12 + 8?</label>
                  <input type="number" min="0" max="99" value={mathAnswer} onChange={e => setMathAnswer(e.target.value)} placeholder="Answer" required className="w-40 bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                </div>

                <button type="submit" disabled={sending} className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  {sending ? <><Spinner className="h-4 w-4" /> Sending...</> : <><Send className="h-4 w-4" /> Submit Quote Request</>}
                </button>
              </div>
            </form>

            <div className="bg-[rgba(20,20,20,0.50)] rounded-2xl p-6 border border-white/10 grid sm:grid-cols-3 gap-4">
              <a href="tel:18765144020" className="flex items-center gap-3 text-white/70 hover:text-[#f97316] transition-colors text-sm">
                <div className="w-9 h-9 rounded-full bg-[#f97316]/20 flex items-center justify-center shrink-0"><Phone className="h-4 w-4 text-[#f97316]" /></div>
                1876-514-4020
              </a>
              <a href="mailto:repairs@arkmaintenance.com" className="flex items-center gap-3 text-white/70 hover:text-[#f97316] transition-colors text-sm">
                <div className="w-9 h-9 rounded-full bg-[#f97316]/20 flex items-center justify-center shrink-0"><Mail className="h-4 w-4 text-[#f97316]" /></div>
                repairs@arkmaintenance.com
              </a>
              <div className="flex items-center gap-3 text-white/55 text-sm">
                <div className="w-9 h-9 rounded-full bg-[#f97316]/20 flex items-center justify-center shrink-0"><MapPin className="h-4 w-4 text-[#f97316]" /></div>
                Newport West, Kingston 11
              </div>
            </div>
          </div>
        </div>
      </div>

      <WebsiteFooter />
    </div>
  )
}
