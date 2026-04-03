'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle2, Fan, ChevronRight, Phone } from 'lucide-react'

const exhaustServices = [
  'Custom exhaust canopy design & fabrication',
  'Exhaust hood installation',
  'Stainless steel canopy manufacturing',
  'Grease filter cleaning & replacement',
  'Exhaust fan installation & repair',
  'Exhaust canopy deep cleaning',
  'Compliance documentation provided',
  'Emergency exhaust repairs',
  'Fire suppression system integration',
  'Exhaust repairs & maintenance contracts',
]

const ductServices = [
  'Custom air duct design & engineering',
  'Galvanized & stainless steel duct fabrication',
  'Air duct installation (all sizes)',
  'Duct cleaning & sanitising',
  'Duct repairs & leak sealing',
  'Insulated duct installation',
  'AC ducting & ventilation balancing',
  'Duct making for commercial kitchens',
  'Hotels, restaurants & industrial ductwork',
  'Maintenance contracts available',
]

const faqs = [
  { q: 'Do you fabricate custom kitchen exhaust canopies?', a: 'Yes. We design and fabricate custom stainless steel exhaust canopies to suit your specific kitchen layout, equipment configuration, and ventilation requirements. Every canopy is precision-engineered for your space.' },
  { q: 'How often should kitchen exhaust systems be cleaned?', a: 'For high-volume commercial kitchens, exhaust canopies should be professionally cleaned every 1–3 months. Lower-volume operations may require cleaning every 6 months. Regular cleaning is essential for fire safety compliance and insurance requirements.' },
  { q: 'Is exhaust canopy cleaning required by law in Jamaica?', a: 'Yes, commercial kitchens are required to maintain clean exhaust systems as part of fire safety regulations and health code compliance. We provide documentation of all cleaning work for your compliance records.' },
  { q: 'Do you provide exhaust services across Jamaica?', a: 'Yes. We have technicians serving Kingston, St Catherine, St Ann, Manchester, and other parishes island-wide for both emergency and scheduled exhaust and duct services.' },
  { q: 'What is included in your duct making and installation service?', a: 'Our duct making service covers engineering design, fabrication using premium galvanized or stainless steel, professional installation, proper sealing and insulation, and airflow balancing and testing to ensure optimal performance.' },
  { q: 'Can you repair existing exhaust systems?', a: 'Absolutely. We diagnose and repair all types of exhaust faults including fan motor failures, grease buildup blockages, duct leaks, filter damage, and control system issues — for all makes and configurations.' },
]

const locations = ['Exhaust Services Kingston', 'Exhaust Services St Catherine', 'Exhaust Services St Ann', 'Exhaust Services Mandeville']

type RevealProps = { children: React.ReactNode; delay?: number; from?: 'left' | 'right' | 'up' | 'scale' }
function Reveal({ children, delay = 0, from = 'up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    Object.assign(el.style, {
      opacity: '0',
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      transform: from === 'left' ? 'translateX(-55px)' : from === 'right' ? 'translateX(55px)' : from === 'scale' ? 'scale(0.90)' : 'translateY(45px)',
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
    <div className="w-full aspect-video overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(249,115,22,0.15)]">
      <video src={src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
    </div>
  )
}

export default function KitchenExhaustServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Head>
        <link rel="preload" href="/videos/exhaust-video-1.mp4" as="video" type="video/mp4" />
      </Head>
      <WebsiteNav activePage="services" />

      {/* HERO VIDEO */}
      <div className="w-full aspect-[4/3] md:aspect-video relative">
        <video
          src="/videos/exhaust-video-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end pb-4 px-4 md:pb-10 md:px-16">
          <div className="md:bg-black/60 md:rounded-xl md:px-6 md:py-4 max-w-xl md:backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <Fan className="h-5 w-5 md:h-7 md:w-7 text-[#f97316] shrink-0" />
              <h1 className="text-lg md:text-4xl font-bold text-[#f97316] leading-tight">Exhaust &amp; Air Duct Services</h1>
            </div>
            <p className="text-white/90 text-xs md:text-base font-medium">Custom fabrication, installation, cleaning &amp; repair across Jamaica</p>
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <Reveal>
        <div className="bg-[#111] border-y border-[#f97316]/30 py-6 text-center px-4">
          <p className="text-white font-bold text-sm md:text-base mb-1">
            <span className="text-[#f97316]">Ask about our Quarterly Exhaust Cleaning &amp; Maintenance Packages</span>
          </p>
          <p className="text-white/60 text-sm mb-3">
            Reduce fire risk, maintain compliance, and qualify for{' '}
            <span className="text-[#f97316] font-bold">15%–25% discount</span> on labour and parts!
          </p>
          <Link href="/get-quote" className="inline-block bg-[#f97316] hover:bg-[#e06010] text-white text-sm font-bold px-8 py-3 rounded-lg uppercase tracking-wide transition-colors">
            Request A Quote or Call-Back
          </Link>
        </div>
      </Reveal>

      <section className="bg-[#0d0d0d] py-16">
        <div className="max-w-[960px] mx-auto px-4 space-y-14">

          {/* Intro */}
          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-5">Kitchen Exhaust Systems &amp; Exhaust Canopy Making</h2>
            <p className="text-white/60 leading-relaxed mb-4">At ARK Maintenance, we deliver complete kitchen exhaust solutions for commercial kitchens and facilities throughout Kingston, St Catherine, and St Ann, ensuring your ventilation systems operate safely, efficiently, and in full compliance with health and fire safety regulations.</p>
            <p className="text-white/60 leading-relaxed mb-4">Our skilled team excels in designing custom exhaust system solutions tailored to meet your specific operational needs, kitchen layout, and cooking volume, ensuring optimal performance and full compliance with fire safety standards. We meticulously handle exhaust canopy making and fabricate complete systems using high-quality stainless steel and commercial-grade materials, guaranteeing exceptional durability and long-term efficiency.</p>
            <p className="text-white/60 leading-relaxed">Our expertise extends to performing expert exhaust repairs and duct repairs, keeping systems in peak operating condition through thorough cleaning, component replacement, and preventative maintenance programs. Our installation services are prompt, precise, and professionally executed, ensuring minimal disruption to your business operations.</p>
          </Reveal>

          {/* VIDEO 2 */}
          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/exhaust-video-2.mp4" /></Reveal>

          {/* Exhaust Services checklist */}
          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-2">Our Exhaust Canopy Services</h2>
            <p className="text-white/50 text-sm mb-6">From design and fabrication to cleaning, repair and compliance — we cover it all:</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {exhaustServices.map((s, i) => (
                <Reveal key={s} delay={i * 45} from="up">
                  <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:border-[#f97316]/50 hover:bg-[#f97316]/5 rounded-lg p-3 transition-all duration-200">
                    <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-white/70 text-[13px]">{s}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* VIDEO 3 */}
          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/exhaust-video-3.mp4" /></Reveal>

          {/* Duct Services */}
          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-4">Air Duct Systems, Duct Fabrication &amp; Duct Installation</h2>
            <p className="text-white/60 leading-relaxed mb-4">We specialize in providing comprehensive services for air duct systems and ducting throughout Kingston, St Catherine, and St Ann, handling every aspect from engineering design to professional duct installation with precision and meticulous attention to detail.</p>
            <p className="text-white/60 leading-relaxed mb-6">Our expert team creates custom air ducts and complete ductwork solutions using premium-quality galvanized steel, stainless steel, and insulated materials. Whether you operate a restaurant, hotel kitchen, food processing facility, or industrial workspace, we design and implement ventilation solutions that address your unique challenges and comply with mechanical codes.</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ductServices.map((s, i) => (
                <Reveal key={s} delay={i * 45} from="up">
                  <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 hover:border-[#f97316]/50 hover:bg-[#f97316]/5 rounded-lg p-3 transition-all duration-200">
                    <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-white/70 text-[13px]">{s}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* Locations */}
          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-3">Exhaust &amp; Duct Services By Location</h2>
            <p className="text-white/50 text-sm mb-5">We have technicians based right across Jamaica. Find exhaust services near you:</p>
            <div className="flex flex-wrap gap-3">
              {locations.map(loc => (
                <span key={loc} className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30 px-4 py-2 rounded-full text-sm font-medium">{loc}</span>
              ))}
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-2">Frequently Asked Questions</h2>
            <p className="text-white/50 text-sm mb-6">Get answers to common questions about our exhaust cleaning, canopy fabrication, and air duct services across Jamaica.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 80} from="up">
                  <details className="border border-[#f97316]/50 rounded-xl group bg-[#111] hover:border-[#f97316] transition-all duration-200">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
                      <span className="font-bold text-[#f97316] group-hover:text-white text-[14px] transition-colors duration-200">{faq.q}</span>
                      <ChevronRight className="h-5 w-5 text-[#f97316] shrink-0 ml-4 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 pt-3 text-white/70 text-[13px] leading-relaxed border-t border-[#f97316]/20">{faq.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal from="scale">
            <div className="bg-[#f97316] rounded-2xl py-10 px-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Need Kitchen Exhaust or Air Duct Services?</h2>
              <p className="text-white/80 mb-6 text-sm">Professional fabrication, installation, cleaning and repair across Jamaica.</p>
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
