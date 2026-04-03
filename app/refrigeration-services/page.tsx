'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle2, Thermometer, ChevronRight, Phone } from 'lucide-react'

const refrigerationChecklist = [
  'Clean Evaporator', 'Clean Evaporator Coil', 'Clean Evaporator Fan Motor', 'Clean Compressor',
  'Clean Condenser Coil', 'Clean Condenser Fan Motor', 'Clean and Check Electrical Circuits',
  'Clean and Check Filters', 'Clean and Check Contactor Points', 'Check Refrigerant Charge',
  'Check Pressure', 'Check Thermostat Settings', 'Check for Leaks', 'Check Relays',
  'General Washing of Unit', 'Flush Drain',
]

const iceMachineChecklist = [
  'Inspect and Clean Ice Bin', 'Clean and Sanitise Ice Making Components',
  'Inspect Water Inlet Valve and Supply Line', 'Clean Water Filtration System',
  'Inspect and Clean Condenser Coils', 'Check Evaporator Plate for Scale Build-up',
  'Test Harvest Cycle Timing', 'Inspect Bin Control and Sensors',
  'Check Refrigerant Charge', 'Test Water Pump and Distributor Tube',
  'Inspect Electrical Connections and Controls', 'Check Ice Production Rate and Quality',
  'Sanitise Ice Chute and Dispenser', 'Inspect Door Seals and Gaskets',
  'Check Drainage System', 'Perform Full System Performance Test',
]

const faqs = [
  { q: 'How quickly can you respond to a refrigeration emergency in Jamaica?', a: 'We offer same-day emergency response for Kingston and St Catherine. For other parishes, we typically respond within 24 hours. Our emergency line is available beyond regular business hours.' },
  { q: 'What types of refrigeration equipment do you repair?', a: 'We repair commercial freezers, refrigerators, cold rooms, walk-in coolers, ice machines, display fridges, blast freezers, and all types of commercial refrigeration equipment.' },
  { q: 'How often should commercial refrigeration be serviced?', a: 'We recommend quarterly servicing for commercial refrigeration equipment used in demanding environments like restaurants and food processing facilities. Bi-annual is the minimum for most commercial units.' },
  { q: 'Do you offer refrigeration maintenance contracts?', a: 'Yes! We offer quarterly and twice-yearly preventative maintenance contracts that include full servicing, priority emergency response, and detailed service reports.' },
  { q: 'Can you repair ice machines?', a: 'Absolutely. We repair all types of ice machines including modular, undercounter, and countertop units. Common issues we fix include slow ice production, poor ice quality, water leaks, and complete system failures.' },
  { q: 'What causes a cold room to lose temperature?', a: 'Common causes include refrigerant leaks, door seal failures, compressor malfunctions, dirty condenser coils, control system errors, and insulation problems. Our technicians diagnose and resolve all these issues.' },
]

type RevealProps = { children: React.ReactNode; delay?: number; from?: 'left' | 'right' | 'up' | 'scale' }
function Reveal({ children, delay = 0, from = 'up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    Object.assign(el.style, {
      opacity: '0',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      transform: from === 'left' ? 'translateX(-50px)' : from === 'right' ? 'translateX(50px)' : from === 'scale' ? 'scale(0.92)' : 'translateY(40px)',
    })
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'none'; obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, from])
  return <div ref={ref}>{children}</div>
}

function AutoplayVideo({ src }: { src: string }) {
  return (
    <div className="w-full aspect-video overflow-hidden rounded-2xl">
      <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
    </div>
  )
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <Reveal key={item} delay={i * 35} from="up">
          <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:border-[#00BFFF]/40 rounded-lg p-3 transition-colors">
            <CheckCircle2 className="h-4 w-4 text-[#00BFFF] shrink-0 mt-0.5" />
            <span className="text-white/70 text-[13px]">{item}</span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

export default function RefrigerationServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Head>
        <link rel="preload" href="/videos/fridge-video-1.mp4" as="video" type="video/mp4" />
      </Head>
      <WebsiteNav activePage="services" />

      {/* HERO VIDEO */}
      <div className="w-full aspect-[4/3] md:aspect-video relative">
        <video
          src="/videos/fridge-video-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-none" />
        <div className="absolute inset-x-0 bottom-0 flex items-end pb-4 px-4 md:pb-10 md:px-16">
          <div className="md:bg-black/55 md:rounded-xl md:px-6 md:py-4 max-w-xl md:backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <Thermometer className="h-5 w-5 md:h-7 md:w-7 text-[#00BFFF] shrink-0" />
              <h1 className="text-xl md:text-4xl font-bold text-[#00BFFF] leading-tight">Refrigeration Services</h1>
            </div>
            <p className="text-white/90 text-xs md:text-base font-medium">Comprehensive Refrigeration Maintenance and Repair across Kingston, St Catherine, and St Ann</p>
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <Reveal>
        <div className="bg-[#111] border-y border-[#00BFFF]/30 py-6 text-center px-4">
          <p className="text-white font-bold text-sm md:text-base mb-1">
            <span className="text-[#00BFFF]">Ask about our Quarterly Equipment Maintenance Packages</span>
          </p>
          <p className="text-white/60 text-sm mb-3">
            It will significantly reduce equipment break-downs, and qualify you for{' '}
            <span className="text-[#00BFFF] font-bold">15%–25% discount</span> on our labour and replacement parts!
          </p>
          <Link href="/get-quote" className="inline-block bg-[#00BFFF] hover:bg-[#0099CC] text-white text-sm font-bold px-8 py-3 rounded-lg uppercase tracking-wide transition-colors">
            Request A Quote or Call-Back
          </Link>
        </div>
      </Reveal>

      <section className="bg-[#0d0d0d] py-16">
        <div className="max-w-[960px] mx-auto px-4 space-y-14">

          {/* ── REFRIGERATION EQUIPMENT SECTION ── */}
          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-5">Refrigeration Repair &amp; Maintenance</h2>
            <p className="text-white/60 leading-relaxed mb-4">At ARK Maintenance, we excel in providing top-notch maintenance and repair services for all types of refrigeration equipment throughout Kingston, St Catherine, and St Ann. Our highly skilled technicians are adept at handling everything from routine maintenance checks to complex emergency repairs beyond regular office hours, ensuring that your refrigeration units operate at peak efficiency around the clock.</p>
            <p className="text-white/60 leading-relaxed mb-4">We recognize that refrigeration failures can result in significant financial losses, compromised product quality, and disrupted business operations, which is why we prioritize rapid response times and effective solutions for businesses across all three parishes.</p>
            <p className="text-white/60 leading-relaxed">Our comprehensive maintenance services include thorough inspections, deep cleaning of components, refrigerant level assessments, condenser and evaporator coil maintenance, testing of system performance, and timely identification and resolution of potential issues before they escalate.</p>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/fridge-video-2.mp4" /></Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-4">Specialized Cold Room Service and Repairs</h2>
            <p className="text-white/60 leading-relaxed mb-4">Our expertise in cold room service and repairs sets us apart as the preferred choice for businesses across Kingston, St Catherine, and St Ann that depend on temperature-controlled storage environments. Cold rooms require precise temperature regulation and consistent performance to protect inventory investments and comply with food safety regulations.</p>
            <p className="text-white/60 leading-relaxed mb-4">Our technicians are trained to diagnose and resolve issues such as temperature fluctuations, door seal failures, insulation problems, refrigerant leaks, compressor malfunctions, and control system errors. We provide both scheduled maintenance visits and emergency cold room repairs to minimize downtime and prevent product spoilage throughout our service areas.</p>
            <p className="text-white/60 leading-relaxed">From walk-in coolers to large-scale cold storage facilities, we have the technical knowledge and practical experience to keep your cold rooms operating reliably.</p>
          </Reveal>

          {/* VIDEO 4 with refrigeration equipment */}
          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/fridge-video-4.mp4" /></Reveal>

          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-2">16 Point Refrigeration Servicing Checklist</h2>
            <p className="text-white/50 text-sm mb-6">This 16 Point Refrigeration Servicing Checklist includes, but is not limited to the following areas. We:</p>
            <Checklist items={refrigerationChecklist} />
          </Reveal>

          {/* ── ICE MACHINE SECTION ── */}
          {/* VIDEO 3 with ice machines */}
          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/fridge-video-3.mp4" /></Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-4">Expert Ice Machine Repairs</h2>
            <p className="text-white/60 leading-relaxed mb-4">Our ice machine repairs service ensures that businesses throughout Kingston, St Catherine, and St Ann never run short on this essential commodity. Our technicians expertly troubleshoot and repair all ice machine types, including modular, undercounter, and countertop units.</p>
            <p className="text-white/60 leading-relaxed mb-4">Common issues we address include slow or stopped ice production, poor ice quality, water leaks, unusual noises, failure to harvest ice, clogged water lines, and complete system failures. We work with all major ice machine brands and have a well-stocked inventory of quality replacement parts to complete most repairs on the first visit.</p>
            <p className="text-white/60 leading-relaxed">Regular ice machine maintenance is critical for food safety compliance and peak production efficiency. Our preventative maintenance service addresses water filtration systems, harvest cycles, bin controls, and production mechanisms to restore full functionality and extend equipment life.</p>
          </Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-2">16 Point Ice Machine Servicing Checklist</h2>
            <p className="text-white/50 text-sm mb-6">Our comprehensive ice machine service checklist includes, but is not limited to the following areas. We:</p>
            <Checklist items={iceMachineChecklist} />
          </Reveal>

          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-3">Refrigeration Services By Location</h2>
            <p className="text-white/50 text-sm mb-5">We have technicians based right across Jamaica. Find refrigeration services near you:</p>
            <div className="flex flex-wrap gap-3">
              {['Refrigeration Kingston', 'Refrigeration St Catherine', 'Refrigeration St Ann', 'Refrigeration Mandeville'].map(loc => (
                <span key={loc} className="bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/30 px-4 py-2 rounded-full text-sm font-medium">{loc}</span>
              ))}
            </div>
          </Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-2">Frequently Asked Questions About Refrigeration Services</h2>
            <p className="text-white/50 text-sm mb-6">Get answers to common questions about our refrigeration repair, maintenance, and cold room services across Jamaica.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 80} from="up">
                  <details className="border border-[#00BFFF]/50 rounded-xl group bg-[#111] hover:border-[#00BFFF] transition-all duration-200">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
                      <span className="font-bold text-[#00BFFF] group-hover:text-white text-[14px] transition-colors duration-200">{faq.q}</span>
                      <ChevronRight className="h-5 w-5 text-[#00BFFF] shrink-0 ml-4 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 pt-3 text-white/70 text-[13px] leading-relaxed border-t border-[#00BFFF]/20">{faq.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="scale">
            <div className="bg-[#00BFFF] rounded-2xl py-10 px-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Need Commercial Refrigeration Repairs?</h2>
              <p className="text-white/80 mb-6 text-sm">Fast, reliable refrigeration services across Jamaica.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/get-quote" className="bg-black hover:bg-black/80 text-white font-bold px-8 py-3 rounded text-sm uppercase tracking-wide transition-colors">Get a Quote</Link>
                <a href="tel:18765144020" className="flex items-center gap-2 border border-white/50 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded text-sm transition-colors">
                  <Phone className="h-4 w-4" /> Call 876-514-4020
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      <WebsiteFooter />
    </div>
  )
}
