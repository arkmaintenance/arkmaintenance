'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle2, Wind, ChevronRight, Phone } from 'lucide-react'

const checklist = [
  'Clean Evaporator', 'Clean Evaporator Coil', 'Clean Evaporator Fan Motor', 'Clean Compressor',
  'Clean Condenser Coil', 'Clean Condenser Fan Motor', 'Clean and Check Electrical Circuits',
  'Clean and Check Filters', 'Clean and Check Contactor Points', 'Check Refrigerant Charge',
  'Check Pressure', 'Check Thermostat Settings', 'Check for Leaks', 'Check Relays',
  'General Washing of Unit', 'Flush Drain',
]

const brands = ['Windy', 'LG', 'Samsung', 'Midea', 'Carrier', 'Daikin', 'Gree', 'Haier', 'Panasonic', 'TCL', 'York', '+ all other brands']

const services = [
  'AC installation (all brands)', 'AC repair and fault diagnosis', 'AC cleaning and deep service',
  'Split unit servicing', 'Window unit servicing', 'Cassette unit servicing',
  'Ducted central AC systems', 'Multi-split system repairs', 'Emergency AC repair (same-day)',
  'AC maintenance contracts', 'Refrigerant regas (re-charging)', 'AC mould removal and sanitising',
]

const faqs = [
  { q: 'What areas do you serve for AC repair?', a: 'We serve Kingston, St Catherine (including Portmore), St Ann (including Ocho Rios), Clarendon, Manchester (Mandeville), and St James (Montego Bay). Our technicians are strategically located island-wide for fast response times.' },
  { q: 'How quickly can you respond to an AC repair emergency?', a: 'We offer same-day emergency response for most areas in Kingston and St Catherine. For other parishes, we typically respond within 24 hours. Our emergency line is available beyond regular business hours.' },
  { q: 'What types of air conditioning systems do you repair?', a: 'We repair and service all types of AC systems including split units, window units, cassette units, ducted central air systems, multi-split systems, and all major brands.' },
  { q: 'Do you offer AC maintenance packages?', a: 'Yes! Ask about our Quarterly Equipment Maintenance Packages — they significantly reduce equipment breakdowns and qualify you for 15%–25% discount on labour and replacement parts.' },
  { q: 'Why is my AC not cooling properly?', a: 'Common causes include low refrigerant, dirty filters or coils, a faulty compressor, blocked condenser unit, or electrical faults. Our technicians use the latest diagnostic tools to identify and fix the issue fast.' },
  { q: 'Do you install new air conditioning systems?', a: 'Yes. We assess your space and recommend the best cooling solution for your needs and budget, then handle the full installation to manufacturer specifications and warranty requirements.' },
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

export default function AirConditionerServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Head>
        <link rel="preload" href="/videos/ac-services-hero.mp4" as="video" type="video/mp4" />
      </Head>
      <WebsiteNav activePage="services" />

      {/* HERO VIDEO */}
      <div className="w-full aspect-[4/3] md:aspect-video relative">
        <video
          src="/videos/ac-services-hero.mp4"
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
              <Wind className="h-5 w-5 md:h-7 md:w-7 text-[#00BFFF] shrink-0" />
              <h1 className="text-xl md:text-4xl font-bold text-[#00BFFF] leading-tight">Air Conditioner Services</h1>
            </div>
            <p className="text-white/90 text-xs md:text-base font-medium">Professional AC repair, installation &amp; maintenance across Jamaica</p>
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

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-5">Professional AC Repair, Installation &amp; Maintenance Across Jamaica</h2>
            <p className="text-white/60 leading-relaxed mb-4">Looking for reliable AC repair or professional air conditioning repair Kingston? ARK Maintenance is Jamaica&apos;s trusted HVAC company, providing comprehensive AC service for residential and commercial clients across Kingston, St Catherine, and St Ann.</p>
            <p className="text-white/60 leading-relaxed mb-4">As one of the leading air conditioning companies in Jamaica, our certified AC technicians deliver prompt, reliable service. Need an AC technician near me? Our team is ready to help with same-day a/c repair near me service.</p>
            <p className="text-white/60 leading-relaxed mb-4">Our HVAC Jamaica specialists service all types of air conditioning systems — mini splits, cassette units, and central AC. Whether you need emergency AC repair or routine maintenance, our expert technicians address every issue swiftly and efficiently.</p>
            <p className="text-white/60 leading-relaxed">Our maintenance packages include thorough inspections, filter replacements, refrigerant level checks, and system optimization to prevent unexpected breakdowns and extend the lifespan of your equipment.</p>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/ac-video-2.mp4" /></Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-4">What We Do</h2>
            <p className="text-white/60 leading-relaxed mb-6">Our highly trained AC technicians deliver fast, reliable repairs, thorough servicing, and expert installations for all types of air conditioning systems — all major brands and models.</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {services.map((s, i) => (
                <Reveal key={s} delay={i * 40} from="up">
                  <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:border-[#00BFFF]/40 rounded-lg p-3 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-[#00BFFF] shrink-0 mt-0.5" />
                    <span className="text-white/70 text-[13px]">{s}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/ac-video-3.mp4" /></Reveal>

          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-2">16 Point Air Conditioner Servicing Checklist</h2>
            <p className="text-white/50 text-sm mb-6">This 16 Point Air Conditioner Servicing Checklist includes, but is not limited to the following areas. We:</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {checklist.map((item, i) => (
                <Reveal key={item} delay={i * 35} from="up">
                  <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:border-[#00BFFF]/40 rounded-lg p-3 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-[#00BFFF] shrink-0 mt-0.5" />
                    <span className="text-white/70 text-[13px]">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/ac-video-4.mp4" /></Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-4">Brands We Service, Repair and Install</h2>
            <div className="flex flex-wrap gap-3">
              {brands.map((b, i) => (
                <Reveal key={b} delay={i * 40} from="scale">
                  <span className="bg-[#00BFFF] hover:bg-white text-white hover:text-black text-[13px] font-bold px-5 py-2.5 rounded-full transition-all duration-200 cursor-default inline-block hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,191,255,0.4)]">{b}</span>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-3">AC Repair Services By Location</h2>
            <p className="text-white/50 text-sm mb-5">We have technicians based right across Jamaica. Find AC services near you:</p>
            <div className="flex flex-wrap gap-3">
              {['AC Repair Kingston', 'AC Repair St Catherine', 'AC Repair St Ann', 'AC Repair Mandeville'].map(loc => (
                <span key={loc} className="bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/30 px-4 py-2 rounded-full text-sm font-medium">{loc}</span>
              ))}
            </div>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/ac-video-5.mp4" /></Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00BFFF] mb-2">Frequently Asked Questions About AC Repair</h2>
            <p className="text-white/50 text-sm mb-6">Get answers to common questions about our air conditioning repair, installation, and maintenance services across Jamaica.</p>
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
              <h2 className="text-2xl font-bold text-white mb-3">Need an AC Technician Near You?</h2>
              <p className="text-white/80 mb-6 text-sm">Fast, reliable AC repair and service across Jamaica.</p>
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
