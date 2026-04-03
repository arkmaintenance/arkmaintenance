'use client'
// v9
import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { ArkChatbot } from '@/components/website/chatbot'
import { GoogleReviews } from '@/components/website/google-reviews'
import { ChevronRight, ChevronLeft, Phone, Wind, Thermometer, Utensils, Fan } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const serviceBadges = [
  'AC Installation & Repairs',
  'AC Cleaning & Maintenance',
  'Refrigeration & Cold Room Repairs',
  'Kitchen Exhaust & Duct Systems',
  'Kitchen & Restaurant Cleaning',
  'Ice Machine Repairs',
]

const services = [
  {
    title: 'Air Conditioner Services',
    desc: 'Complete AC repair, AC service, installation & maintenance. Your trusted AC technician near me for air conditioning repair Kingston and across Jamaica.',
    href: '/air-conditioner-services',
    img: '/images/ac-repair-team.png',
    Icon: Wind,
  },
  {
    title: 'Refrigeration Services',
    desc: 'Expert repairs and servicing for commercial freezers, fridges, cold rooms, and ice machines across Jamaica.',
    href: '/refrigeration-services',
    img: '/images/refrigeration-service.png',
    Icon: Thermometer,
  },
  {
    title: 'Kitchen Cleaning Services',
    desc: 'Professional deep cleaning and repairs for ovens, stoves, grills, deep fryers, and all commercial kitchen equipment.',
    href: '/kitchen-cleaning-services',
    img: '/images/kitchen-cleaning.png',
    Icon: Utensils,
  },
  {
    title: 'Kitchen Exhaust & Air Duct Services',
    desc: 'Custom fabrication, installation, cleaning, and repair of exhaust canopy systems and air ducts for commercial kitchens.',
    href: '/kitchen-exhaust-services',
    img: '/images/exhaust-service.jpg',
    Icon: Fan,
  },
]

const workImages = [
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EXHAUST%20CLEANING%2C%20CANOPY%20CLEANING%2C%20KITCHEN%20CLEANING%2C%20EXHAUST%20HOOD%20REPAIRS%2C%20EXHAUST%20REPAIRS-GPv1cbfGae5OFhpT9Bex6HsowPwKmW.png', alt: 'Exhaust Hood Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARK%20MAINTENANCE%2C%20DEEP%20FRYER%20REPAIRS%2C%20STEAM%20TABLE%20REPAIRS%2C%20FOOD%20WARMER%20REPAIRS%2C%20EXHAUST%20FAN%20REPAIRS%2C%20CANOPY%20RERPAIRS%2C%20DUCT%20REPAIRS%2C-CwMab1Ze4CKRIhIJypiGb7aRroima5.png', alt: 'Deep Fryer Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVEN%20CLEANING%2C%20OVEN%20REPAIRS%2C%20ARK%20MAINTENANCE%2C%20KITCHEN%20CLEANING%2C%20KITCHEN%20REPAIRS%2C%20RESTAURANT%20CLEANING%20KINGSTON-rzpYq0RISnqIADvnGu2gtbaiqXVome.png', alt: 'Oven Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOOD%20WARMER%20REPAIRS%2C%20STEAM%20TABLE%20CLEANING%2C%20STEAM%20TABLE%20REPAIRS%2C%20ARK%20MAINTENANCE.%20KITCHEN%20CLEANING%2C%20KITCHEN%20SERVICING-iwsnvO6SV98SgaQGcG5Dxou2JZiDSE.png', alt: 'Steam Table Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EXTRACTOR%20FAN%2C%20EXHAUST%20FAN%20%20REPAIRS%20KINGSTON%2C%20EXHAUST%20FAN%20CLEANING%20KINGSTON%2C%20EXHAUST%20FAN%20REPAIRS%20OCHO%20RIOS%2C%20EXHAUST%20FAN%20REPAIRS%20MONTEGO%20BAY-6jgAKipazlOS12zm2bIaTD7ccF3SHk.png', alt: 'Extractor Fan Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DEEP%20FRYER%20CLEANING%20KINGSTON%2C%20DEEP%20FRYER%20REPAIRS%20KINGSTON%2C%20DEEP%20FRYER%20REPAIRS%20OCHO%20RIOS%2C%20DEEP%20FRYER%20REPAIRS%20MONTEGO%20BAY-Mh7vv0n1XDpVXUjH5Od5cRHuiQLqWA.png', alt: 'Deep Fryer Element Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GRILL%20CLEANING%20KINGSTON%2C%20GRILL%20REPAIRS%20OCHO%20RIOS%2C%20GRILL%20CLEANING%20MONTEGO%20BAY%2C%20DEEP%20FRYER%20REPAIRS%2C%20ARK%20MAINTENANCE.%20CANOPY%20CLEANING-WgPabUD6sIuTPsNxiCI0fsu431Os1J.png', alt: 'Grill Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EXHAUST%20FAN%20CLEANING%2C%20EXHAUST%20CANOPY%20CLEANING%2C%20EXTRACTOR%20FAN%20CLEANING%2C%20EXTRACTOR%20FAN%20REPAIRS%2C%20ARK-MZmExZYPuRkWvTHIXndqRWNqcaP1qK.png', alt: 'Exhaust Duct Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOOD%20WARMER%20REPAIRS%2C%20FOOD%20WARMER%20CLEANING%2C%20STEAM%20TABLE%20CLEANING%2C%20STEAM%20TABLE%20REPAIRS%2C%20%20FOOD%20WARMR%20SERVICING%2C%20ARK%20MAINTENANCE-lUY0JtxRKdcEVTasWrywQPfusZ9mKY.png', alt: 'Food Warmer Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARK%20MAINTENANCE%2C%20OVEN%20REPAIRS%2C%20STOVE%20REPAIRS%2C%20EXHAUST%20FAN%20REPAIRS%2C%20CANOPY%20REPAIRS%2C%20EXTRACTOR%20FAN%20REPAIRS%2C%20KITCHEN%20CLEANING%20KINGSTON-X9aHrMSA7jFLpM0BUXLXb0gwV7FfHU.png', alt: 'Canopy Interior Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OVEN%20REPAIRS%20%20MONTEGO%20BAY%2C%20OVEN%20CLEANING%20JAMAICA%2C%20ARK%20MAINTENANCE%2C%20KITCHEN%20CLEANING%20JAMAICA%2C%20KITCHEN%20EQUIPMENT%20REPAIRS-w6WtAbmbSiJCM7WeAl5M8mZyNHzHMO.png', alt: 'Oven Interior Cleaning' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FOOD%20WARMER%20REPAIRS%20OCHO%20RIOS%2C%20FOOD%20WARMER%20REPAIRS%20KINGSTON%2C%20FOOD%20WARMER%20REPAIRS%20MONTEGO%20BAY%2C%20ARK%20MAINTENANCE-c42qn3jOBuFfaYpSAfjHhWUq35tQDe.png', alt: 'Food Warmer Repairs' },
]

function OurWorkCarousel() {
  const [current, setCurrent] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % workImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + workImages.length) % workImages.length)
  const next = () => setCurrent((c) => (c + 1) % workImages.length)

  return (
    <section className="bg-[#f97316] py-20">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-white mb-2">Our Work</h2>
          <p className="text-white/80 text-sm">Before &amp; After — See the difference professional service makes</p>
        </div>
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden aspect-video shadow-xl">
            <img
              src={workImages[current].src}
              alt={workImages[current].alt}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          </div>
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
          <div className="flex justify-center gap-2 mt-4">
            {workImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
          <p className="text-center text-white/80 text-sm mt-3">{workImages[current].alt}</p>
        </div>
      </div>
    </section>
  )
}

const faqs = [
  { q: 'What areas in Jamaica do you serve for AC repair?', a: 'We serve Kingston, St Catherine (including Portmore), St Ann (including Ocho Rios), Clarendon, Manchester (Mandeville), and St James (Montego Bay). Our technicians are strategically located island-wide for fast response times.' },
  { q: 'How quickly can you respond to an AC repair emergency?', a: 'We offer same-day emergency response for most areas in Kingston and St Catherine. For other parishes, we typically respond within 24 hours. Our emergency line is available beyond regular business hours.' },
  { q: 'What types of air conditioning systems do you repair?', a: 'We repair and service all types of AC systems including split units, window units, cassette units, ducted central air systems, multi-split systems, and all major brands including LG, Samsung, Midea, Carrier, and more.' },
  { q: 'Do you offer AC maintenance packages?', a: 'Yes! We offer quarterly and twice-yearly service contracts that include routine inspections, cleaning, and priority emergency response. These packages help extend equipment life and prevent costly breakdowns.' },
  { q: 'What refrigeration services do you provide?', a: 'We provide commercial freezer repairs, refrigerator regas, cold room servicing, ice machine repairs and maintenance, and preventative maintenance contracts for all refrigeration equipment.' },
  { q: 'Do you offer kitchen exhaust system installation?', a: 'Yes, we fabricate, install, and maintain custom exhaust canopy systems for commercial kitchens. We also provide regular cleaning services to meet fire safety standards and health code compliance.' },
  { q: 'How can I get a quote for your services?', a: 'You can request a quote by calling us at 1876-514-4020 or 1876-476-1748, emailing repairs@arkmaintenance.com, or filling out the contact form on our website.' },
  { q: 'What are your business hours?', a: 'Our regular hours are Monday to Friday 8:00 AM to 5:00 PM and Saturday 9:00 AM to 1:00 PM. Emergency services are available outside of these hours for urgent situations.' },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  anim = 'up',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  anim?: 'up' | 'down' | 'left' | 'right' | 'scale'
  delay?: number
}) {
  const { ref, visible } = useInView()
  const animMap = { up: 'fadeInUp', down: 'fadeInDown', left: 'fadeInLeft', right: 'fadeInRight', scale: 'fadeInScale' }
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `${animMap[anim]} 0.75s ease ${delay}ms both` : 'none',
      }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <WebsiteNav activePage="home" />

      {/* ── HERO VIDEO ── */}
      <section className="relative bg-black overflow-hidden w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src="https://www.youtube.com/embed/PraC0o0_HmI?autoplay=1&mute=1&loop=1&playlist=PraC0o0_HmI&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&disablekb=1&fs=0"
          title="ARK Maintenance Services"
          allow="autoplay; encrypted-media"
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
        />
      </section>

      {/* ── SERVICES SECTION ── */}
      <section className="bg-black py-20">
        <div className="max-w-[1240px] mx-auto px-4">
          <Reveal anim="down">
            <div className="text-center mb-10">
              <p className="text-[#3B82F6] text-sm font-semibold uppercase tracking-widest mb-2">Our Services</p>
              <h2 className="text-[30px] md:text-[36px] font-bold text-white mb-6">HVAC Jamaica</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {serviceBadges.map((b) => (
                  <span key={b} className="bg-[#3B82F6] text-white text-[12px] font-medium px-4 py-2 rounded-full">{b}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {services.map((s, i) => (
              <Reveal key={s.href} anim="scale" delay={i * 100} className="h-full">
                <Link
                  href={s.href}
                  className="group flex flex-col h-full bg-[#0D0D0D] rounded-2xl overflow-hidden border border-white/5 hover:border-[#f97316]/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(249,115,22,0.15)] cursor-pointer"
                >
                  <div className="relative h-56 overflow-hidden rounded-t-2xl flex-shrink-0">
                    <img
                      src={s.img}
                      alt={s.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 rounded-lg bg-[#f97316] flex items-center justify-center shadow-lg">
                      <s.Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-[15px] text-[#f97316] mb-2 leading-snug">{s.title}</h3>
                    <p className="text-white/50 text-[13px] leading-relaxed mb-4 flex-grow">{s.desc}</p>
                    <span className="inline-flex items-center gap-1 text-[#3B82F6] text-[13px] font-semibold group-hover:gap-2 transition-all duration-200 mt-auto">
                      Learn More <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS WIDGET ── */}
      <GoogleReviews />

      {/* ── OUR WORK ── */}
      <OurWorkCarousel />

      {/* ── FAQ ── */}
      <section className="bg-black py-20">
        <div className="max-w-[860px] mx-auto px-4">
          <Reveal anim="up">
            <div className="text-center mb-10">
              <p className="text-[#f97316] text-sm font-semibold uppercase tracking-widest mb-2">FAQ</p>
              <h2 className="text-[28px] font-bold text-white mb-3">Frequently Asked Questions</h2>
              <p className="text-white/40 text-sm">Answers to common questions about our HVAC, refrigeration, and kitchen maintenance services across Jamaica.</p>
            </div>
          </Reveal>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} anim="up" delay={i * 60}>
                <details className="border border-white/10 rounded-lg group bg-[#111] hover:border-[#f97316]/30 transition-colors">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[14px] text-white hover:bg-white/5 rounded-lg transition-colors list-none select-none">
                    <span>{faq.q}</span>
                    <ChevronRight className="h-4 w-4 text-[#f97316] group-open:rotate-90 transition-transform shrink-0 ml-4" />
                  </summary>
                  <div className="px-5 pb-5 pt-2 text-white/50 text-[13px] leading-relaxed border-t border-white/10">{faq.a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#f97316] text-white py-14">
        <Reveal anim="scale">
          <div className="max-w-[800px] mx-auto px-4 text-center">
            <h2 className="text-[26px] md:text-[30px] font-bold mb-4">Need an AC Technician Near You?</h2>
            <p className="text-white/80 mb-8 text-[15px] leading-relaxed">
              Contact Jamaica&apos;s leading HVAC company today for professional AC repair, air conditioning service, and kitchen equipment maintenance across Kingston, St Catherine, and St Ann.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/get-quote" className="bg-black hover:bg-black/80 text-white font-bold px-10 py-4 rounded text-sm uppercase tracking-wide transition-all hover:scale-105 hover:shadow-lg">
                Get a Quote
              </Link>
              <a href="tel:18765144020" className="flex items-center gap-2 border border-white/50 hover:border-white bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded text-sm transition-all hover:scale-105">
                <Phone className="h-4 w-4" /> Call 876-514-4020
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <WebsiteFooter />
      <ArkChatbot />
    </div>
  )
}
