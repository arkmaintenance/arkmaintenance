import { INCIDENT_REPORT_COLORS, type IncidentReportDraft } from '@/lib/incident-reports'
import { cn } from '@/lib/utils'

interface IncidentReportPreviewProps {
  data: IncidentReportDraft
  className?: string
}

export function IncidentReportPreview({ data, className }: IncidentReportPreviewProps) {
  return (
    <div className={cn('mx-auto w-[210mm] min-h-[297mm] bg-white text-gray-900 shadow-2xl p-[15mm] flex flex-col', className)}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <img src="/images/ark-logo.png" alt="ARK Logo" className="h-16 object-contain" />
          <p className="text-[10px] text-gray-500 italic mt-1">Professional HVAC & Kitchen Maintenance Services</p>
        </div>
        <div className="text-right text-[10px] text-gray-500 leading-tight">
          <p>Kingston: 71 First Street, Newport Blvd.</p>
          <p>Tel: 876-514-4020 / 876-476-1748</p>
          <p>Email: admin@arkmaintenance.com</p>
          <p>www.arkmaintenance.com</p>
        </div>
      </div>

      <div className="h-0.5 bg-[#19459a] mb-6" />

      {/* Title Bar */}
      <div 
        className="h-16 flex items-center px-6 rounded-lg mb-8 overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${INCIDENT_REPORT_COLORS.titleGradientStart}, ${INCIDENT_REPORT_COLORS.titleGradientEnd})`
        }}
      >
        <h1 className="text-white text-xl font-bold uppercase tracking-wide">
          INCIDENT REPORT: {data.title}
        </h1>
      </div>

      {/* Meta Section */}
      <div className="bg-[#f3f8ff] border border-[#e1e8f0] rounded-xl p-6 flex justify-between mb-10">
        <div>
          <p className="text-[11px] font-bold text-[#ff6b00] uppercase tracking-[0.15em] mb-2">PREPARED FOR</p>
          <p className="text-xl font-bold text-gray-900 leading-none mb-1">{data.contactPerson}</p>
          <p className="text-sm text-[#4b5563] mb-1">{data.clientName}</p>
          <p className="text-[11px] text-[#6b7280] leading-relaxed">{data.address}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold text-[#ff6b00] uppercase tracking-[0.15em] mb-2">DATE</p>
          <p className="text-xl font-bold text-gray-900 leading-none">
            {new Date(data.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1">
        {data.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-[#19459a] text-xl font-bold border-b-2 border-[#ff6b00] pb-1.5 mb-4">
              {section.heading}
            </h2>
            <ul className="space-y-3 pl-4">
              {section.points.map((point) => (
                <li key={point.id} className="text-[13px] text-gray-800 flex items-start gap-3 leading-relaxed">
                  <span className="text-[#19459a] mt-1.5 text-lg leading-none">•</span>
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12">
        {/* Service Blocks */}
        <div className="text-center space-y-3 mb-8">
          <div className="text-[9px] font-bold tracking-tight">
            <span className="text-[#ff6b00]">AIR COND./REFRIGERATION:</span> <span className="text-[#4b5563] font-normal">SALES + SERVICE + REPAIR + INSTALLATION</span>
            <span className="mx-2 text-[#9ca3af]">|</span>
            <span className="text-[#19459a]">KITCHEN EXHAUST:</span> <span className="text-[#4b5563] font-normal">FABRICATION + MAINTENANCE + REPAIRS</span>
          </div>
          <div className="text-[9px] font-bold tracking-tight">
            <span className="text-[#ff6b00]">KITCHEN EQUIPMENT:</span> <span className="text-[#4b5563] font-normal">CLEANING + REPAIRS + SALES</span>
            <span className="mx-2 text-[#9ca3af]">|</span>
            <span className="text-[#19459a]">DEEP CLEANING:</span> <span className="text-[#4b5563] font-normal">DE-GREASING + DE-SCALING</span>
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-44 rounded-sm overflow-hidden border border-slate-200">
            <img src="/images/service-contract-footer-left.png" alt="Footer Left" className="w-full h-full object-cover" />
          </div>
          <div className="h-44 rounded-sm overflow-hidden border border-slate-200">
            <img src="/images/service-contract-footer-right.png" alt="Footer Right" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="h-[3px] bg-[#19459a] rounded-full mb-6" />
        
        <div className="flex justify-center gap-6 mb-8">
          <span className="text-[10px] font-bold text-[#ff6b00] tracking-wide">New Air Conditioners</span>
          <span className="text-[10px] font-bold text-[#19459a] tracking-wide">AC Maintenance</span>
          <span className="text-[10px] font-bold text-[#ff6b00] tracking-wide">Kitchen Exhaust/Duct Systems</span>
          <span className="text-[10px] font-bold text-[#19459a] tracking-wide">Kitchen Equipment Deep Cleaning</span>
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <p className="text-center text-[10px] text-[#48bb78] font-semibold tracking-wide">
            Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd • www.arkmaintenance.com
          </p>
        </div>
      </div>
    </div>
  )
}
