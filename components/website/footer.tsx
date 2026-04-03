import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const seoLinks = [
  {
    category: 'AC Repair',
    links: [
      { label: 'AC Repair Kingston', href: '/ac-repair/kingston' },
      { label: 'AC Repair St Catherine', href: '/ac-repair/st-catherine' },
      { label: 'AC Repair St Ann', href: '/ac-repair/st-ann' },
      { label: 'AC Repair Mandeville', href: '/ac-repair/mandeville' },
      { label: 'AC Repair Portmore', href: '/ac-repair/portmore' },
    ],
  },
  {
    category: 'Refrigeration',
    links: [
      { label: 'Refrigeration Kingston', href: '/refrigeration-services/kingston' },
      { label: 'Refrigeration St Catherine', href: '/refrigeration-services/st-catherine' },
      { label: 'Refrigeration St Ann', href: '/refrigeration-services/st-ann' },
      { label: 'Refrigeration Mandeville', href: '/refrigeration-services/mandeville' },
    ],
  },
  {
    category: 'Kitchen Cleaning',
    links: [
      { label: 'Kitchen Cleaning Kingston', href: '/kitchen-cleaning-services/kingston' },
      { label: 'Kitchen Cleaning St Catherine', href: '/kitchen-cleaning-services/st-catherine' },
      { label: 'Kitchen Cleaning St Ann', href: '/kitchen-cleaning-services/st-ann' },
      { label: 'Kitchen Cleaning Mandeville', href: '/kitchen-cleaning-services/mandeville' },
    ],
  },
  {
    category: 'Kitchen Exhaust',
    links: [
      { label: 'Kitchen Exhaust Kingston', href: '/kitchen-exhaust-services/kingston' },
      { label: 'Kitchen Exhaust St Catherine', href: '/kitchen-exhaust-services/st-catherine' },
      { label: 'Kitchen Exhaust St Ann', href: '/kitchen-exhaust-services/st-ann' },
      { label: 'Kitchen Exhaust Mandeville', href: '/kitchen-exhaust-services/mandeville' },
    ],
  },
]

export function WebsiteFooter() {
  return (
    <footer>
      {/* ── TOP SECTION — dark bg ── */}
      <div className="bg-[#111] border-t border-white/10">
        <div className="max-w-[1240px] mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div>
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={160}
              height={60}
              style={{ height: '48px', width: 'auto' }}
              className="mb-4"
            />
            <p className="text-white/50 text-[13px] leading-relaxed">
              Jamaica&apos;s trusted HVAC and kitchen equipment service company.
            </p>
          </div>

          {/* Col 2 — Our Services */}
          <div>
            <h3 className="font-bold text-sm text-[#f97316] mb-4 uppercase tracking-wider">Our Services</h3>
            <ul className="space-y-2.5">
              <li><Link href="/air-conditioner-services" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Air Conditioner Services</Link></li>
              <li><Link href="/refrigeration-services" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Refrigeration Services</Link></li>
              <li><Link href="/kitchen-cleaning-services" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Kitchen Cleaning Services</Link></li>
              <li><Link href="/kitchen-exhaust-services" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Kitchen Exhaust &amp; Air Duct Services</Link></li>
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h3 className="font-bold text-sm text-[#f97316] mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Contact</Link></li>
              <li><Link href="/join-us" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Join Our Team</Link></li>
              <li><Link href="/get-quote" className="text-white/50 text-[13px] hover:text-[#f97316] transition-colors">Get a Quote</Link></li>
            </ul>
          </div>

          {/* Col 4 — Contact Us */}
          <div>
            <h3 className="font-bold text-sm text-[#f97316] mb-4 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:18765144020" className="flex items-start gap-2.5 text-white/50 hover:text-[#f97316] transition-colors text-[13px]">
                  <Phone className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />1876-514-4020
                </a>
              </li>
              <li>
                <a href="tel:18764761748" className="flex items-start gap-2.5 text-white/50 hover:text-[#f97316] transition-colors text-[13px]">
                  <Phone className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />1876-476-1748
                </a>
              </li>
              <li>
                <a href="https://wa.me/18765144020" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 text-white/50 hover:text-[#25D366] transition-colors text-[13px]">
                  <span className="text-[#25D366] shrink-0"><WhatsAppSVG /></span>WhatsApp Us
                </a>
              </li>
              <li>
                <a href="mailto:repairs@arkmaintenance.com" className="flex items-start gap-2.5 text-white/50 hover:text-[#f97316] transition-colors text-[13px]">
                  <Mail className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />repairs@arkmaintenance.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-[13px]">
                <MapPin className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                <span>71 First Street, Newport West,<br />Kingston 11, Jamaica</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION — Black background, SEO links ── */}
      <div className="bg-black text-white">
        <div className="max-w-[1240px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {seoLinks.map((cat) => (
              <div key={cat.category}>
                <h4 className="text-[#f97316] font-bold text-[12px] uppercase tracking-wider mb-3">{cat.category}</h4>
                <ul className="space-y-1.5">
                  {cat.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white/50 text-[12px] hover:text-white transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-[11px] border-t border-white/10 pt-6">
            <span className="text-white/60 font-semibold">Serving all 14 parishes of Jamaica:</span>{' '}
            Kingston · St. Andrew · St. Thomas · Portland · St. Mary · St. Ann · Trelawny · St. James · Hanover · Westmoreland · St. Elizabeth · Manchester · Clarendon · St. Catherine
          </p>
        </div>
      </div>

      {/* ── BOTTOM SECTION — Black background, copyright ── */}
      <div className="bg-black border-t-2 border-[#f97316]">
        <div className="max-w-[1240px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/40">
          <p>&copy; {new Date().getFullYear()} ARK Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd. All rights reserved.</p>
          <p>www.arkmaintenance.com</p>
        </div>
      </div>
    </footer>
  )
}
