import Link from 'next/link'
import { WebsiteNav } from '@/components/website/nav'
import { WebsiteFooter } from '@/components/website/footer'
import { CheckCircle, Phone, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Kitchen Exhaust & Air Duct Services Jamaica | ARK Maintenance',
  description:
    'Custom fabrication, installation, cleaning, and repair of commercial kitchen exhaust systems and air ducts across Kingston, St Catherine, and St Ann, Jamaica.',
}

const services = [
  'Custom Exhaust Canopy Fabrication', 'Exhaust Hood Installation', 'Exhaust System Cleaning',
  'Grease Filter Cleaning & Replacement', 'Kitchen Duct Cleaning', 'Air Duct Installation & Repair',
  'Exhaust Fan Servicing', 'Fire Suppression System Inspection', 'Make-Up Air Unit Installation',
  'Ventilation System Design', 'Commercial Kitchen Duct Fabrication', 'Quarterly & Annual Maintenance Contracts',
]

const faqs = [
  { q: 'How often should kitchen exhaust systems be cleaned?', a: 'High-volume operations like fast food restaurants should clean exhaust systems monthly. Most commercial kitchens require quarterly cleaning. Low-volume kitchens may require bi-annual cleaning. Regular cleaning is required for fire safety compliance.' },
  { q: 'Do you fabricate custom exhaust canopies?', a: 'Yes, we design and fabricate custom stainless steel exhaust canopies to fit any commercial kitchen layout. Our fabrication team creates hoods that meet all local health and safety requirements.' },
  { q: 'What is the risk of not cleaning kitchen exhaust systems?', a: 'Failure to clean exhaust systems allows grease to accumulate, creating a serious fire hazard. It also reduces ventilation efficiency, leads to poor air quality, and can result in failed health inspections and voided insurance coverage.' },
  { q: 'Do you provide documentation after cleaning?', a: 'Yes, we provide a detailed cleaning report and certificate after every exhaust cleaning, documenting the work performed. This documentation is important for fire marshal compliance and insurance requirements.' },
  { q: 'Can you repair damaged ductwork?', a: 'Yes, we repair and replace damaged sections of ductwork, reseal joints, and ensure proper airflow throughout your ventilation system. We also fabricate replacement duct sections when needed.' },
]

export default function KitchenExhaustPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <WebsiteNav activePage="services" />

      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vidu-image-3160973357910227%20%281%29-Bvb5JXqm3zTHQbz0wtaAnBOVkMHiKm.png')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-4">
          <nav className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Link href="/" className="hover:text-[#f97316] transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Kitchen Exhaust &amp; Air Duct Services</span>
          </nav>
          <p className="text-[#f97316] text-xs font-bold uppercase tracking-widest mb-3">Exhaust &amp; Ventilation</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance max-w-3xl">Kitchen Exhaust &amp; Air Duct Services</h1>
          <p className="text-white/70 text-lg max-w-2xl mb-8">Custom fabrication, installation, cleaning, and repair of exhaust systems and air ducts across Jamaica.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/get-quote" className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-8 py-3 rounded transition-colors text-sm uppercase tracking-wide">Get a Quote</Link>
            <a href="tel:18765144020" className="flex items-center gap-2 border border-white/40 hover:border-[#f97316] text-white font-semibold px-6 py-3 rounded transition-colors text-sm">
              <Phone className="h-4 w-4" /> Call 1876-514-4020
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0d0d0d]">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Professional Kitchen Exhaust &amp; Air Duct Services</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                At ARK Maintenance, we provide comprehensive kitchen exhaust and air duct services for commercial kitchens throughout Kingston, St Catherine, and St Ann. From custom stainless steel canopy fabrication and installation to regular exhaust cleaning and duct repairs, our team delivers complete ventilation solutions that keep your kitchen safe, compliant, and efficient.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                Proper kitchen ventilation is essential for fire safety, air quality, and regulatory compliance. Our certified technicians ensure your exhaust system operates at peak performance, removing heat, smoke, grease, and cooking fumes effectively while meeting all fire marshal and health code requirements.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">Our Kitchen Exhaust &amp; Duct Services</h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {services.map(s => (
                  <div key={s} className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm font-medium">{s}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Why Regular Exhaust Cleaning Is Critical</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Grease accumulation in kitchen exhaust systems is one of the leading causes of commercial kitchen fires in Jamaica and worldwide. Regular professional cleaning removes this dangerous buildup from hoods, ducts, fans, and filters — significantly reducing fire risk and protecting your business, staff, and customers.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                Beyond fire safety, clean exhaust systems operate more efficiently, consume less energy, and have a longer service life. We provide detailed documentation after every cleaning, giving you the compliance records you need for insurance, fire marshal inspections, and health department requirements.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">Custom Exhaust Canopy Fabrication</h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Need a new or replacement exhaust canopy? Our fabrication team designs and manufactures custom stainless steel exhaust hoods built to fit your specific kitchen layout and cooking equipment. All fabricated canopies meet local building codes and commercial kitchen standards. We handle the full installation, including ductwork connections and fan setup.
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">Exhaust Services By Location</h2>
              <p className="text-white/60 mb-4">We have technicians based right across Jamaica:</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Exhaust Cleaning Kingston', 'Exhaust Cleaning St Catherine', 'Exhaust Cleaning St Ann', 'Exhaust Cleaning Mandeville'].map(loc => (
                  <span key={loc} className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30 px-3 py-1 rounded-full text-sm font-medium">{loc}</span>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
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

            <div className="space-y-6">
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-lg text-white mb-3">Get a Quote Today</h3>
                <p className="text-white/60 text-sm mb-5">Fast response. Professional service. Guaranteed results.</p>
                <Link href="/get-quote" className="block w-full text-center bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold py-3 rounded transition-colors text-sm uppercase tracking-wide mb-3">Request Quote</Link>
                <a href="tel:18765144020" className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#f97316] text-white/80 py-3 rounded transition-colors text-sm w-full mb-2">
                  <Phone className="h-4 w-4" /> 1876-514-4020
                </a>
                <a href="tel:18764761748" className="flex items-center justify-center gap-2 border border-white/20 hover:border-[#f97316] text-white/80 py-3 rounded transition-colors text-sm w-full">
                  <Phone className="h-4 w-4" /> 1876-476-1748
                </a>
              </div>
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-lg text-white mb-4">Other Services</h3>
                <ul className="space-y-2">
                  {[
                    { label: 'AC Repair & Air Conditioning', href: '/ac-repair-air-conditioning-service' },
                    { label: 'Refrigeration Services', href: '/refrigeration-services' },
                    { label: 'Kitchen Cleaning Services', href: '/kitchen-cleaning-services' },
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
