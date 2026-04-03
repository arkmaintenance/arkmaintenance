'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Upload, Send, CheckCircle, Users, Award, TrendingUp, FileText, X, ChevronRight } from 'lucide-react'

const positions = [
  'AC Technician',
  'Refrigeration Technician',
  'Kitchen Equipment Technician',
  'General Maintenance Technician',
  'Field Supervisor',
  'Administrative Assistant',
  'Other Position',
]

const experienceLevels = [
  'Entry Level (0–1 years)',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
]

export default function CareersPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '', experience: '', message: '' })
  const [resume, setResume] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setResume(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.position) { toast.error('Please fill in all required fields'); return }
    setSending(true)
    try {
      let resumeBase64 = '', resumeFilename = ''
      if (resume) {
        const reader = new FileReader()
        resumeBase64 = await new Promise(resolve => {
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.readAsDataURL(resume)
        })
        resumeFilename = resume.name
      }
      const response = await fetch('/api/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, resumeBase64, resumeFilename }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit')
      setSubmitted(true)
      toast.success('Application submitted!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <WebsiteNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">Thank you for your interest in joining ARK Maintenance. We will review your application and get back to you soon.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-50 transition-colors text-sm">Go Home</Link>
              <Link href="/contact" className="bg-[#00BFFF] text-black font-bold px-6 py-2 rounded hover:bg-[#00aadd] transition-colors text-sm">Contact Us</Link>
            </div>
          </div>
        </div>
        <WebsiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <WebsiteNav activePage="careers" />

      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover.jpeg-FW19ClbJksspOOP6m0p6ZndaWHefPt.webp')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Join Our Team</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-white/70 text-lg max-w-2xl mb-8">
            Be part of Jamaica&apos;s leading AC, Refrigeration &amp; Kitchen Maintenance company. We&apos;re always looking for talented individuals to grow with us.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Users, label: '50+ Team Members' },
              { icon: Award, label: 'Industry Leader' },
              { icon: TrendingUp, label: 'Growing Company' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-sm font-medium">
                <Icon className="h-4 w-4 text-[#00BFFF]" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Why Work With Us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Competitive Salary', desc: 'Industry-leading compensation packages' },
              { title: 'Health Benefits', desc: 'Medical and dental coverage' },
              { title: 'Career Growth', desc: 'Training and advancement opportunities' },
              { title: 'Tools & Equipment', desc: 'Company-provided tools and uniforms' },
            ].map(b => (
              <div key={b.title} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                <h3 className="font-bold mb-1 text-gray-900">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application */}
      <main className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Open Positions */}
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-1">Open Positions</h2>
                <p className="text-gray-500 text-sm mb-5">Click to select a position</p>
                <div className="space-y-2">
                  {positions.map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setFormData({ ...formData, position: pos })}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.position === pos
                          ? 'border-[#00BFFF] bg-[#00BFFF]/10 text-[#00BFFF]'
                          : 'border-gray-200 hover:border-[#00BFFF]/40 text-gray-700'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Apply Now</h2>
                <p className="text-gray-600 text-sm mb-6">Fill out the form to submit your application.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="mt-1 border-gray-300 bg-white text-gray-900" required />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="mt-1 border-gray-300 bg-white text-gray-900" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="876-555-0123" className="mt-1 border-gray-300 bg-white text-gray-900" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Experience Level</Label>
                      <Select value={formData.experience} onValueChange={v => setFormData({ ...formData, experience: v })}>
                        <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900"><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>{experienceLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Position Applying For *</Label>
                    <Select value={formData.position} onValueChange={v => setFormData({ ...formData, position: v })}>
                      <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900"><SelectValue placeholder="Select a position" /></SelectTrigger>
                      <SelectContent>{positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Resume / CV</Label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                      {resume ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-[#00BFFF]" />
                          <div className="text-left">
                            <p className="font-medium text-sm text-gray-900">{resume.name}</p>
                            <p className="text-xs text-gray-500">{(resume.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button type="button" onClick={() => setResume(null)} className="text-red-500 hover:text-red-600 p-1"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                          <button type="button" onClick={() => fileRef.current?.click()} className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors">Choose File</button>
                          <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cover" className="text-sm font-semibold">Cover Letter / Additional Information</Label>
                    <Textarea id="cover" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about yourself and why you want to join ARK Maintenance..." className="mt-1 border-gray-300 bg-white text-gray-900 min-h-[120px]" />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-[#00BFFF] hover:bg-[#00aadd] text-black font-bold">
                    {sending ? <><Spinner className="mr-2 h-4 w-4" />Submitting...</> : <><Send className="mr-2 h-4 w-4" />Submit Application</>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  )
}
