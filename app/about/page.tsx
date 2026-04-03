'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { ChevronRight } from 'lucide-react'

/* ── tiny hook: fires when element enters viewport ── */
function useInView(threshold = 0.18) {
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

/* ── animated section wrapper ── */
function Reveal({ children, className = '', dir = 'up', delay = 0 }: {
  children: React.ReactNode; className?: string; dir?: 'up' | 'left' | 'right'; delay?: number
}) {
  const { ref, visible } = useInView()
  const anim = dir === 'left' ? 'animate-fade-in-left' : dir === 'right' ? 'animate-fade-in-right' : 'animate-fade-in-up'
  return (
    <div
      ref={ref}
      className={`transition-none ${className}`}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible ? `${anim.replace('animate-', '')} 0.75s ease ${delay}ms both` : 'none',
      }}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <WebsiteNav activePage="about" />

      {/* Breadcrumb */}
      <div className="bg-[#111] border-b border-white/10 py-3">
        <div className="max-w-[1240px] mx-auto px-6">
          <nav className="flex items-center gap-2 text-white/50 text-sm">
            <Link href="/" className="hover:text-[#f97316] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#f97316]">About</span>
          </nav>
        </div>
      </div>

      {/* ══ MISSION ══ */}
      <section className="py-24 bg-black overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <Reveal dir="left">
              <h2
                className="text-6xl md:text-7xl text-[#f97316] mb-8 leading-tight"
                style={{ fontFamily: 'var(--font-dancing), Dancing Script, cursive', fontWeight: 700 }}
              >
                Our Mission
              </h2>
              <p className="text-white leading-relaxed text-[15px] text-justify mb-5">
                ARK Air Conditioning, Refrigeration And Kitchen Maintenance Ltd (ARK Maintenance) is Jamaica&apos;s leading HVAC company — a Dynamic World Class Refrigeration and Kitchen Maintenance Company providing Highly Trained and Proficient AC technicians to Serve our Customers&apos; Needs.
              </p>
              <p className="text-white leading-relaxed text-[15px] text-justify mb-5">
                As one of the trusted air conditioning companies in Jamaica, we deliver AC repair, AC service, and air conditioning repair Kingston with Honesty and Integrity. We&apos;re known for Cost Efficiency, Fast Response, and Excellent Customer Service. Searching for an &quot;AC technician near me&quot;? We offer the best Emergency Response service throughout Kingston, St Catherine, and St Ann.
              </p>
              <p className="text-white leading-relaxed text-[15px] text-justify">
                Whether you need a/c repair near me or comprehensive HVAC Jamaica services, we are dedicated to ensuring optimal performance and longevity of your equipment. Through our commitment to exceptional AC service and customer satisfaction, we strive to be the trusted partner you can rely on.
              </p>
            </Reveal>

            {/* Right — rocket icon */}
            <Reveal dir="right" delay={150}>
              <div className="flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rocket-mission-BlQ18hAA-uQilTOSmdUdRuIpP4Pd55E6baauHtw.png"
                  alt="Our Mission — ARK Maintenance"
                  className="w-52 h-52 object-contain animate-float-icon drop-shadow-[0_0_30px_rgba(249,115,22,0.25)]"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="h-px bg-white/8 mx-6" />

      {/* ══ VISION ══ */}
      <section className="py-24 bg-black overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — lightbulb icon */}
            <Reveal dir="left" delay={100}>
              <div className="flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vision-lightbulb-DjuTxFV3-GA6ELuTycy4V5MtUUaIBlwa5bzNNHo.png"
                  alt="Our Vision — ARK Maintenance"
                  className="w-52 h-52 object-contain animate-float-icon drop-shadow-[0_0_30px_rgba(250,204,21,0.25)]"
                  style={{ animationDelay: '0.8s' }}
                />
              </div>
            </Reveal>

            {/* Right — text */}
            <Reveal dir="right">
              <h2
                className="text-6xl md:text-7xl text-[#f97316] mb-8 leading-tight"
                style={{ fontFamily: 'var(--font-dancing), Dancing Script, cursive', fontWeight: 700 }}
              >
                Our Vision
              </h2>
              <p className="text-white leading-relaxed text-[15px] text-justify mb-5">
                Our Vision is to set new industry standards by continuously evolving our techniques, embracing cutting-edge technology, and fostering a culture of excellence and reliability. Our goal is to create lasting partnerships with our clients, ensuring their equipment operates at peak performance and contributes to their success.
              </p>
              <p className="text-white leading-relaxed text-[15px] text-justify">
                By prioritizing sustainability and eco-friendly practices, we aim to make a positive impact on the environment and the communities we serve. Together, we envision a future where every piece of equipment is meticulously maintained, enhancing its longevity and functionality, and where our name is synonymous with trust and excellence in service.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="h-px bg-white/8 mx-6" />

      {/* ══ OUR VALUES ══ */}
      <section className="py-24 bg-black overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6">

          {/* Heading row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <Reveal dir="left">
              <h2
                className="text-6xl md:text-7xl text-[#f97316] leading-tight"
                style={{ fontFamily: 'var(--font-dancing), Dancing Script, cursive', fontWeight: 700 }}
              >
                Our Values
              </h2>
              <p className="text-white text-[15px] text-justify mt-4 max-w-xl">
                Through these values, we aim to deliver unparalleled service and build lasting partnerships, ensuring your equipment performs optimally and stands the test of time.
              </p>
            </Reveal>
            <Reveal dir="right" delay={150}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/values-handshake-CnYWwmXU-C3Y98saeJPQWTIHl6BiRvc85smCFSs.png"
                alt="Our Values"
                className="w-48 h-48 object-contain animate-float-icon shrink-0"
                style={{ animationDelay: '1.2s' }}
              />
            </Reveal>
          </div>

          {/* Our Values diagram — no white wrapper */}
          <Reveal delay={200}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/our-values-CpV3Nqha-zXz7Halqf3YdNqUDG8TJINEcepsZdL.png"
              alt="ARK Maintenance — Reliability, Customer-Centric Approach, Integrity, Quality Assurance, Environmental Responsibility, Innovation"
              className="w-full max-w-3xl mx-auto block h-auto"
            />
          </Reveal>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  )
}
