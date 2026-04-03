'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle, Flame, ChevronRight, Phone } from 'lucide-react'

const benefits = [
  'Increased kitchen hygiene which discourages rats, roaches and other pests',
  'Increased electrical efficiency and significantly reduced power consumption',
  'Extended equipment life and reduced replacement costs',
  'Enhanced food safety and health code compliance',
  'Improved cooking performance and food quality',
  'Reduced risk of unexpected equipment failures during peak hours',
]

const faqs = [
  { q: 'What does your commercial kitchen cleaning service include?', a: 'Our service includes deep cleaning and degreasing of all cooking equipment (ovens, stoves, fryers, grills, steamers), exhaust canopy and duct cleaning, floor degreasing, sanitization of surfaces, and cleaning behind and under equipment.' },
  { q: 'How often should a commercial kitchen be professionally cleaned?', a: 'We recommend a full deep clean quarterly for most commercial kitchens. High-volume operations like fast food restaurants may need monthly cleaning. Regular cleaning prevents grease buildup, pest issues, and fire hazards.' },
  { q: 'Do you offer kitchen cleaning services outside of Kingston?', a: 'Yes! We serve Kingston, St Catherine (including Portmore), St Ann (including Ocho Rios), Clarendon, and Manchester. Contact us to check availability in your area.' },
  { q: 'Can you clean during off-hours to avoid disrupting our business?', a: 'Absolutely. We offer flexible scheduling including evenings and weekends to minimize disruption to your operations. We work around your business hours.' },
  { q: 'Is exhaust canopy cleaning really necessary for fire safety?', a: 'Yes, it is critical. Grease accumulation in exhaust systems is a leading cause of commercial kitchen fires. Regular cleaning meets fire marshal requirements and insurance standards. We provide documentation of all cleaning work.' },
  { q: 'What kitchen equipment do you repair and maintain?', a: 'We repair and maintain stoves, ovens, deep fryers, grills, steamers, food warmers, ranges, exhaust fans, ice machines, and all other commercial kitchen equipment.' },
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

export default function KitchenCleaningPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Head>
        <link rel="preload" href="/videos/kitchen-video-2.mp4" as="video" type="video/mp4" />
      </Head>
      <WebsiteNav activePage="services" />

      {/* HERO VIDEO */}
      <div className="w-full aspect-[4/3] md:aspect-video relative">
        <video
          src="/videos/kitchen-video-2.mp4"
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
              <Flame className="h-5 w-5 md:h-7 md:w-7 text-[#f97316] shrink-0" />
              <h1 className="text-xl md:text-4xl font-bold text-[#f97316] leading-tight">Kitchen Cleaning Services</h1>
            </div>
            <p className="text-white/90 text-xs md:text-base font-medium">Professional Kitchen Equipment Maintenance across Kingston, St Catherine, and St Ann</p>
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <Reveal>
        <div className="bg-[#111] border-y border-[#f97316]/30 py-6 text-center px-4">
          <p className="text-white font-bold text-sm md:text-base mb-1">
            <span className="text-[#f97316]">Ask about our Quarterly Equipment Maintenance Packages</span>
          </p>
          <p className="text-white/60 text-sm mb-3">
            It will significantly reduce equipment break-downs, and qualify you for{' '}
            <span className="text-[#f97316] font-bold">15%–25% discount</span> on our labour and replacement parts!
          </p>
          <Link href="/get-quote" className="inline-block bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-bold px-8 py-3 rounded-lg uppercase tracking-wide transition-colors">
            Request A Quote or Call-Back
          </Link>
        </div>
      </Reveal>

      <section className="bg-[#0d0d0d] py-16">
        <div className="max-w-[960px] mx-auto px-4 space-y-14">

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-5">Commercial Kitchen Deep Cleaning</h2>
            <p className="text-white/60 leading-relaxed mb-4">Deep-cleaning, de-scaling and de-greasing. These are the first words that come to mind when we think of kitchen equipment maintenance. When these tasks are performed consistently, they enable your equipment to keep performing, even in the most rigorous cooking conditions.</p>
            <p className="text-white/60 leading-relaxed mb-4">Less strain is placed on your equipment&apos;s electrical and mechanical parts when maintenance is conducted regularly, and upcoming defects can be more easily detected and addressed before they escalate into expensive breakdowns. At ARK Maintenance, we serve commercial kitchens throughout Kingston, St Catherine, and St Ann with comprehensive maintenance solutions designed to maximize equipment performance and lifespan.</p>
            <p className="text-white/60 leading-relaxed">Whether you have stoves, ovens, deep-fryers, extractor fans, exhaust hoods, food warmers, grills, steamers, ranges, or any other commercial kitchen equipment across Kingston, St Catherine, and St Ann, we ensure that each piece is meticulously maintained to meet industry standards.</p>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/kitchen-video-1.mp4" /></Reveal>

          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-4">Specialized Exhaust Cleaning &amp; Exhaust Canopy Cleaning</h2>
            <p className="text-white/60 leading-relaxed mb-4">Fire prevention is a critical concern for every commercial kitchen, making our exhaust cleaning service one of the most important safety investments you can make. Grease accumulation in exhaust systems and ventilation hoods represents a serious fire hazard that can threaten lives, property, and your business continuity.</p>
            <p className="text-white/60 leading-relaxed">Our professional exhaust canopy cleaning service removes dangerous grease buildup from hoods, ducts, filters, fans, and all ventilation components throughout Kingston, St Catherine, and St Ann. We provide detailed documentation of our exhaust cleaning work for your compliance records.</p>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/kitchen-video-3.mp4" /></Reveal>

          <Reveal from="right">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-5">Benefits of Regular Maintenance</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <Reveal key={b} delay={i * 60} from="up">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 hover:border-[#f97316]/40 rounded-lg p-4 transition-colors">
                    <CheckCircle className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">{b}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/kitchen-video-4.mp4" /></Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-4">Comprehensive Kitchen Cleaning &amp; Restaurant Cleaning Services</h2>
            <p className="text-white/60 leading-relaxed mb-4">Our kitchen cleaning Kingston service goes beyond basic equipment maintenance to deliver complete sanitation solutions for commercial kitchens throughout St Catherine and St Ann. Our restaurant cleaning Kingston service addresses every surface, appliance, and component in your cooking space — from floors and walls to ceiling vents and behind equipment where grease and debris typically accumulate.</p>
            <p className="text-white/60 leading-relaxed">We utilize industrial-strength degreasers, sanitizers, and specialized equipment to eliminate bacteria, remove stubborn grease deposits, and restore hygiene standards that satisfy health inspectors. We offer flexible scheduling including nights and weekends to accommodate your business needs.</p>
          </Reveal>

          <Reveal from="scale" delay={100}><AutoplayVideo src="/videos/kitchen-video-5.mp4" /></Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-4">Expert Deep Fryer Repairs &amp; Complete Equipment Support</h2>
            <p className="text-white/60 leading-relaxed mb-4">When equipment malfunctions occur, rapid response is essential to minimize revenue loss and maintain service quality. Our deep fryer repairs service addresses all common issues including faulty heating elements, temperature control problems, oil filtration failures, ignition system malfunctions, and electrical complications.</p>
            <p className="text-white/60 leading-relaxed">We repair all major brands of commercial deep fryers, responding promptly to emergency service calls throughout Kingston, St Catherine, and St Ann. Our technicians carry an extensive inventory of quality replacement parts, enabling us to complete most repairs during the first visit.</p>
          </Reveal>

          <Reveal from="left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-3">Kitchen Cleaning By Location</h2>
            <p className="text-white/50 text-sm mb-5">We have technicians based right across Jamaica. Find kitchen cleaning near you:</p>
            <div className="flex flex-wrap gap-3">
              {['Kitchen Cleaning Kingston', 'Kitchen Cleaning St Catherine', 'Kitchen Cleaning St Ann', 'Kitchen Cleaning Mandeville'].map(loc => (
                <span key={loc} className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30 px-4 py-2 rounded-full text-sm font-medium">{loc}</span>
              ))}
            </div>
          </Reveal>

          <Reveal from="up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f97316] mb-2">Frequently Asked Questions About Kitchen Cleaning</h2>
            <p className="text-white/50 text-sm mb-6">Get answers to common questions about our kitchen cleaning, exhaust cleaning, and equipment repair services across Jamaica.</p>
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

          <Reveal from="scale">
            <div className="bg-[#f97316] rounded-2xl py-10 px-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Need Commercial Kitchen Cleaning?</h2>
              <p className="text-white/80 mb-6 text-sm">Professional kitchen cleaning and maintenance across Jamaica.</p>
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
