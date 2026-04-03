'use client'

import { useState, useRef } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Send, CheckCircle, Upload, X, Phone, Mail, MapPin, MessageCircle, Globe } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [files, setFiles] = useState<File[]>([])
  const [mathAnswer, setMathAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (files.length + selected.length > 5) { toast.error('Maximum 5 files'); return }
    setFiles(prev => [...prev, ...selected])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) { toast.error('Please fill in all required fields'); return }
    if (mathAnswer !== '20') { toast.error('Security check failed. 12 + 8 = 20'); return }
    setSending(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send message')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setMathAnswer('')
      setFiles([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen font-sans">
      <WebsiteNav activePage="contact" />

      {/* Success modal overlay */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full text-center bg-[#111] border border-[#f97316]/40 rounded-2xl p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#f97316]/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-[#f97316]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">Thank you for contacting us. We will get back to you as soon as possible.</p>
            <Link
              href="/"
              className="inline-block bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-10 py-3 rounded-lg transition-colors text-sm uppercase tracking-widest"
            >
              Go Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="block mx-auto mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOR%20CONTACT%20US%20PAGE%20-cK9GLnoXGxpB4mJMf6rkie94F64Tqb.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 pt-20 pb-24 px-4">
          <div className="text-center mb-10">
            <p className="text-[#f97316] text-sm font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" /> Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact <span className="text-[#f97316]">Us</span>
            </h1>
            <p className="text-white/70 text-base max-w-xl mx-auto">Have questions? We&apos;re here to help. Reach out to our team for professional HVAC and kitchen equipment services.</p>
          </div>

          <div className="max-w-[860px] mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { icon: <Phone className="h-6 w-6" />, label: 'Phone', value: '1876-514-4020', href: 'tel:18765144020' },
                { icon: <Phone className="h-6 w-6" />, label: 'Phone', value: '1876-476-1748', href: 'tel:18764761748' },
                { icon: <Mail className="h-6 w-6" />, label: 'Email', value: 'repairs@arkmaintenance.com', href: 'mailto:repairs@arkmaintenance.com' },
                { icon: <Globe className="h-6 w-6" />, label: 'Website', value: 'arkmaintenance.com', href: 'https://arkmaintenance.com' },
              ].map(card => (
                <a key={card.value} href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="bg-[rgba(20,20,20,0.50)] border border-white/10 rounded-xl p-4 flex flex-col items-center text-center hover:border-[#f97316]/50 transition-colors group">
                  <div className="text-[#f97316] mb-2 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <p className="text-white/50 text-xs mb-1">{card.label}</p>
                  <p className="text-white font-semibold text-xs leading-tight">{card.value}</p>
                </a>
              ))}
            </div>

            <div className="bg-[rgba(20,20,20,0.50)] border border-white/10 rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f97316]/20 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-[#f97316]" />
              </div>
              <div>
                <p className="text-white/50 text-xs mb-0.5">Address</p>
                <p className="text-white font-semibold text-sm">71 First Street, Newport West, Kingston 11, Jamaica</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-[rgba(20,20,20,0.55)] rounded-2xl p-8 mb-4 border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-6">Send Us a Message</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-white mb-2 block">Your Name <span className="text-[#f97316]">*</span></label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                    </div>
                    <div>
                      <label className="text-[13px] font-semibold text-white mb-2 block">Email Address <span className="text-[#f97316]">*</span></label>
                      <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 block">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="876-XXX-XXXX" className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 block">Your Message <span className="text-[#f97316]">*</span></label>
                    <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Describe your needs..." rows={4} required className="w-full bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 block">Attachments (optional)</label>
                    <div className="border-2 border-dashed border-[#f97316]/40 hover:border-[#f97316] rounded-xl p-5 text-center transition-colors bg-black/30">
                      <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFiles} className="hidden" />
                      {files.length > 0 ? (
                        <div className="space-y-2 text-left">
                          {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-1.5">
                              <span className="text-white/80 text-xs truncate">{f.name}</span>
                              <button type="button" onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 ml-2"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
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
                  <div>
                    <label className="text-[13px] font-semibold text-white mb-2 block">
                      Security Check <span className="text-[#f97316]">*</span> — What is 12 + 8?
                    </label>
                    <input type="number" min="0" max="99" value={mathAnswer} onChange={e => setMathAnswer(e.target.value)} placeholder="Answer" required className="w-40 bg-[#1a1a1a] border border-[#f97316] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f97316] text-sm" />
                  </div>
                  <button type="submit" disabled={sending} className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    {sending ? <><Spinner className="h-4 w-4" /> Sending...</> : <><Send className="h-4 w-4" /> Send Message</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <WebsiteFooter />
    </div>
  )
}
