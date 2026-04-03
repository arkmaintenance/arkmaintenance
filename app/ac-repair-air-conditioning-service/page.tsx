import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle, Phone, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'AC Repair & Air Conditioning Service Jamaica | ARK Maintenance',
  description:
    'Expert AC repair, air conditioning installation, servicing and maintenance across Kingston, St Catherine, and St Ann. Your trusted AC technician near me in Jamaica.',
}

const checklist = [
  'Check Thermostat & Controls', 'Clean or Replace Air Filters', 'Clean Evaporator Coil',
  'Clean Condenser Coil', 'Clean Condenser Fan & Motor', 'Check Refrigerant Charge & Pressure',
  'Check for Leaks', 'Flush & Clear Drain Line', 'Check Electrical Connections',
  'Check Capacitors & Contactors', 'Lubricate Moving Parts', 'Test System Performance',
  'Check Airflow & Duct Integrity', 'Check Blower Motor', 'General Washing of Outdoor Unit',
  'Provide Full Service Report',
]

const faqs = [
  { q: 'How do I know if my AC needs repair?', a: 'Common signs include warm air from vents, unusual noises, frequent cycling, high energy bills, ice on the unit, or poor airflow. If you notice any of these, call us for a diagnosis.' },
  { q: 'What brands of AC do you service?', a: 'We service all major brands including LG, Samsung, Midea, Carrier, Daikin, Haier, TCL, Panasonic, Fujitsu, and many more.' },
  { q: 'How often should I service my AC?', a: 'We recommend servicing your AC at least twice per year for residential units and quarterly for commercial units to maintain efficiency and prevent breakdowns.' },
  { q: 'Do you offer emergency AC repair?', a: 'Yes, we offer emergency AC repair services beyond regular business hours. Call 1876-514-4020 or 1876-476-1748 for emergency service.' },
  { q: 'What areas do you cover for AC repair in Jamaica?', a: 'We cover Kingston, St Catherine (including Portmore), St Ann (including Ocho Rios), Clarendon, Manchester, and St James (Montego Bay).' },
]

export default function ACRepairPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <WebsiteNav activePage="services" />

      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover.jpeg-FW19ClbJksspOOP6m0p6ZndaWHefPt.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-4">
          <nav className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Link href="/" className="hover:text-[#f97316] transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">AC Repair &amp; Air Conditioning Service</span>
          </nav>
          <p className="text-[#f97316] text-xs font-bold uppercase tracking-widest mb-3">HVAC Experts</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance max-w-3xl">AC Repair &amp; Air Conditioning Service</h1>
          <p className="text-white/70 text-lg max-w-2xl mb-8">
            Complete AC repair, AC service, installation &amp; maintenance. Your trusted AC technician near me for air conditioning repair Kingston.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/get-quote" className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-8 py-3 rounded transition-colors text-sm uppercase tracking-wide">Get a Quote</Link>
            <a href="tel:18765144020" className="flex items-center gap-2 border border-white/40 hover:border-[#f97316] text-white font-semibold px-6 py-3 rounded transition-colors text-sm">
              <Phone className="h-4 w-4" /> Call 1876-514-4020
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[#0d0d0d]">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Professional AC Repair &amp; Air Conditioning Service in Jamaica</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                At ARK Maintenance, we provide comprehensive AC repair and air conditioning service across Kingston, St Catherine, and St Ann. Our highly trained technicians diagnose and repair all types of air conditioning systems — from residential split units to large commercial HVAC installations.
              </p>
              <p className="text-white/60 leading-relaxed mb-6">
                Whether you need routine AC cleaning and servicing, emergency AC repair, refrigerant regas, or a full AC installation, our team delivers fast, reliable, and cost-effective solutions. We are your trusted &quot;AC technician near me&quot; throughout Jamaica.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4 mt-10">AC Services We Offer</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {['AC Installation', 'AC Repair & Fault Diagnosis', 'AC Cleaning & Servicing', 'Refrigerant Regas', 'AC Replacement & Upgrades', 'Preventative Maintenance Contracts', 'Ductwork Inspection & Repair', 'Commercial HVAC Servicing'].map(item => (
                  <div key={item} className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-4 mt-10">16 Point AC Servicing Checklist</h2>
              <p className="text-white/60 mb-6">Our comprehensive AC service includes, but is not limited to:</p>
              <div className="grid sm:grid-cols-2 gap-2 mb-8">
                {checklist.map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#f97316] shrink-0" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-4 mt-10">AC Repair Services by Location</h2>
              <p className="text-white/60 mb-4">We have technicians based right across Jamaica. Find AC repair near you:</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['AC Repair Kingston', 'AC Repair St Catherine', 'AC Repair Portmore', 'AC Repair St Ann', 'AC Repair Mandeville', 'AC Repair Montego Bay'].map(loc => (
                  <span key={loc} className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30 px-3 py-1 rounded-full text-sm font-medium">{loc}</span>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-6 mt-10">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map(faq => (
                  <details key={faq.q} className="border border-white/10 rounded-xl group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-white hover:bg-white/5 rounded-xl list-none text-sm">
                      {faq.q}
                      <ChevronRight className="h-4 w-4 text-white/40 group-open:rotate-90 transition-transform shrink-0 ml-3" />
                    </summary>
                    <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/10 pt-3">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="space-y-6">
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-lg text-white mb-3">Get a Quote Today</h3>
                <p className="text-white/60 text-sm mb-5">Fast response. Professional service. Guaranteed results.</p>
                <Link href="/get-quote" className="block w-full text-center bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3 rounded transition-colors text-sm uppercase tracking-wide mb-3">Request Quote</Link>
                <a href="tel:18765144020" className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#f97316] text-white/80 py-3 rounded transition-colors text-sm w-full">
                  <Phone className="h-4 w-4" /> 1876-514-4020
                </a>
                <a href="tel:18764761748" className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#f97316] text-white/80 py-3 rounded transition-colors text-sm w-full mt-2">
                  <Phone className="h-4 w-4" /> 1876-476-1748
                </a>
              </div>

              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-lg text-white mb-4">Other Services</h3>
                <ul className="space-y-2">
                  {[
                    { label: 'Refrigeration Services', href: '/refrigeration-services' },
                    { label: 'Kitchen Cleaning Services', href: '/kitchen-cleaning-services' },
                    { label: 'Kitchen Exhaust & Air Duct', href: '/kitchen-exhaust-air-duct-services' },
                  ].map(s => (
                    <li key={s.href}>
                      <Link href={s.href} className="flex items-center gap-2 text-sm text-white/60 hover:text-[#f97316] transition-colors py-1">
                        <ChevronRight className="h-4 w-4 text-[#f97316]" /> {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  )
}
