'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount?: number
  amount: number
  section?: string
}

interface QuotationData {
  quote_number: string
  date: string
  payment_terms: string
  service_description: string
  timeline?: string
  isServiceContract?: boolean
  recurringSchedule?: string
  scopeTemplate?: string
  scopeOfWork?: string
  scopeOfWorkPoints?: string[]
  client: {
    name: string
    company: string
    address: string
    city: string
    email?: string
  }
  items: QuotationItem[]
  subtotal: number
  total: number
}

interface QuotationTemplateProps {
  data: QuotationData
}

// ── Scope of work checklists ─────────────────────────────────────────────────

const SCOPE_TEMPLATES: Record<string, { title: string; intro: string; points: string[] }> = {
  ac_servicing: {
    title: '16 Point Air Conditioning Servicing Checklist',
    intro: 'Our 16 Point Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning of Evaporator, Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condensor Fan Motor, Condensor Coils, Fan Blades and Motor.',
      'Cleaning and Treating of Drain Pan and Drain Line.',
      'Cleaning and Treating of Air Filters.',
      'Straightening of Evaporator and Condensor Coil Fins.',
      'Checking Refrigerant (Freon) levels for adequate cooling.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking the Indoor & Outdoor Fan Motor Amp draw.',
      'Checking Electrical Components.',
      'Checking Thermostat for Proper Operation.',
      'Checking for Refrigerant Leaks.',
      'Checking & Testing the Capacitor.',
      'Checking the Contactor.',
      'Inspecting Overall Operation of Unit.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  refrigeration: {
    title: '16 Point Refrigeration Servicing Checklist',
    intro: 'Our 16 Point Refrigeration Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning of Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condenser Coils, Fan Blades and Condenser Fan Motor.',
      'Cleaning and Treating of Drain Pan and Drain Line.',
      'Cleaning and Treating of Air Filters and Door Gaskets.',
      'Straightening of Evaporator and Condenser Coil Fins.',
      'Checking Refrigerant (Freon) levels for adequate cooling.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking the Condenser Fan Motor Amp draw.',
      'Checking all Electrical Components and Wiring.',
      'Checking Thermostat / Temperature Controller for Proper Operation.',
      'Checking for Refrigerant Leaks throughout the system.',
      'Checking & Testing the Start and Run Capacitors.',
      'Checking the Contactor and Relay.',
      'Inspecting Overall Operation of the Refrigeration Unit.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  exhaust: {
    title: 'Kitchen Exhaust System Servicing Checklist',
    intro: 'Our Kitchen Exhaust System Service Includes but is not limited to:',
    points: [
      'De-greasing and cleaning of exhaust hood interior surfaces.',
      'Cleaning of exhaust hood filters and grease traps.',
      'Inspection and cleaning of exhaust ductwork.',
      'Cleaning and inspection of exhaust fan blades and housing.',
      'Checking exhaust fan motor for proper operation and amp draw.',
      'Lubricating exhaust fan motor bearings and moving parts.',
      'Checking and tightening all electrical connections.',
      'Inspection of make-up air system (if applicable).',
      'Checking belt tension and condition (belt-drive systems).',
      'Testing exhaust fan speed and airflow.',
      'Inspection of fire suppression system nozzles and coverage.',
      'Checking grease collection containers and replacing if necessary.',
      'Inspection of hood baffle filters for damage or excessive grease.',
      'Checking all access panels and seals for integrity.',
      'Testing overall system operation and airflow balance.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
  ice_machine: {
    title: '16 Point Ice Machine Servicing Checklist',
    intro: 'Our 16 Point Ice Machine Servicing Method Includes but is not limited to:',
    points: [
      'Cleaning and sanitising the ice machine interior and bin.',
      'Cleaning of Evaporator Coils and Evaporator Fan Motor.',
      'Cleaning of Condenser Coils and Condenser Fan Motor.',
      'Descaling the water distribution system and spray nozzles.',
      'Replacing the water filter (where applicable).',
      'Cleaning and inspecting the water pump and float valve.',
      'Checking Refrigerant (Freon) levels for proper ice production.',
      'Checking Superheat and Subcooling.',
      'Checking the Compressor Amp draw.',
      'Checking all Electrical Components and Wiring.',
      'Checking Thermostat and Ice Thickness Control.',
      'Checking for Refrigerant Leaks throughout the system.',
      'Checking & Testing the Capacitor.',
      'Checking water inlet valve and drain valve for proper operation.',
      'Inspecting Overall Operation and ice production rate.',
      'Recording all findings and Maintenance data for future reference.',
    ],
  },
}

// ── Template ─────────────────────────────────────────────────────────────────

export const QuotationTemplate = forwardRef<HTMLDivElement, QuotationTemplateProps>(
  ({ data }, ref) => {
    const hasDiscountColumn = data.items.some((item: any) => item.discount && !item.section)
    const minimumVisibleRows = 6
    const lineItems = data.items.filter(it => it.section === undefined)
    const fillerCount = Math.max(0, minimumVisibleRows - data.items.length)
    const fillerRows = Array.from({ length: fillerCount })
    
    const calculateLineTotal = (item: QuotationItem) => 
      (Number(item.qty) || 1) * (Number(item.unit_price) || 0) - (Number(item.discount) || 0)
      
    const calculatedSubtotal = data.items.reduce((sum, item) => 
      sum + (item.section ? 0 : calculateLineTotal(item)), 0)
    const calculatedTotal = calculatedSubtotal

    const bankingDetails = [
      { label: 'Bank', value: 'First Global Bank' },
      { label: 'Branch', value: 'Ocho Rios' },
      { label: 'Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.' },
      { label: 'Branch Code', value: '99094' },
      { label: 'Account Number', value: '99094 0006 439' },
      { label: 'Account Type', value: 'Savings' },
    ]

    const scopeDef = data.scopeTemplate ? SCOPE_TEMPLATES[data.scopeTemplate] : null
    const contractType = data.isServiceContract ? 'SERVICE CONTRACT' : 'STANDARD QUOTATION'
    const scheduleLabel = data.recurringSchedule
      ? data.recurringSchedule.charAt(0).toUpperCase() + data.recurringSchedule.slice(1).replace('-', ' ')
      : 'One-time'

    return (
      <div
        ref={ref}
        className="bg-white text-black px-3 py-8 mx-auto font-sans w-[794px] min-h-[1123px] flex flex-col"
        style={{ fontSize: '12px' }}
      >
        {/* Header Row 1: Logo left, Address right */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={220}
              height={90}
              style={{ width: 'auto', height: '90px' }}
            />
          </div>
          <div className="text-right text-xs text-gray-600 leading-snug">
            <p>Kingston: 71 First Street, Newport Blvd.</p>
            <p>Tel: 876-514-4020 / 876-476-1748</p>
            <p>Email: admin@arkmaintenance.com</p>
            <p>www.arkmaintenance.com</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 mb-4" />

        {/* Header Row 2: Prepared For left, Quotation title+details right */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-bold text-[#1a1a2e] tracking-widest mb-2">PREPARED FOR</p>
            <div className="border-2 border-[#FF6B00] rounded-md px-4 py-3 bg-orange-50 min-w-[220px]">
              <p className="font-bold text-black text-[14px]">{data.client.name}</p>
              {data.client.company && <p className="text-[#FF6B00] font-semibold">{data.client.company}</p>}
              {data.client.address && <p className="text-[#FF6B00]">{data.client.address}</p>}
              {data.client.city && <p className="text-[#FF6B00]">{data.client.city}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-[#FF6B00] leading-none mb-2">QUOTATION</h1>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p><span className="font-normal text-gray-500">Quotation:</span> <span className="font-bold">{data.quote_number}</span></p>
              <p><span className="font-normal text-gray-500">Date:</span> <span className="font-bold">{data.date}</span></p>
              <p><span className="font-normal text-gray-500">Payment Terms:</span> <span className="font-bold">{data.payment_terms}</span></p>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="bg-[#1a1a2e] text-white py-2 px-4 font-bold text-center mb-4 uppercase text-[15px] tracking-wide">
          {data.service_description}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-linear-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
              <th className="text-white text-left py-2 px-3 text-sm">#</th>
              <th className="text-white text-left py-2 px-3 text-sm font-bold">Description</th>
              <th className="text-white text-center py-2 px-3 text-sm">Qty</th>
              <th className="text-white text-right py-2 px-3 text-sm">Unit Price</th>
              {hasDiscountColumn && (
                <th className="text-white text-right py-2 px-3 text-sm">Discount</th>
              )}
              <th className="text-white text-right py-2 px-3 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) =>
              item.section !== undefined ? (
                <tr key={index}>
                  <td colSpan={hasDiscountColumn ? 6 : 5}
                    className="py-1.5 px-3 bg-orange-50 border-l-4 border-[#FF6B00] font-bold text-[#FF6B00] text-xs uppercase tracking-wider">
                    {item.section}
                  </td>
                </tr>
              ) : (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 border-b border-gray-200">{lineItems.indexOf(item) + 1}</td>
                  <td className="py-2 px-3 border-b border-gray-200 font-bold text-[13px]">{item.description}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-center">{item.qty}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {Number(item.unit_price || 0).toLocaleString()}</td>
                  {hasDiscountColumn && (
                    <td className="py-2 px-3 border-b border-gray-200 text-right text-red-500">
                      {item.discount ? `JMD ${Number(item.discount).toLocaleString()}` : ''}
                    </td>
                  )}
                  <td className="py-2 px-3 border-b border-gray-200 text-right font-bold text-[#FF6B00]">JMD {calculateLineTotal(item).toLocaleString()}</td>
                </tr>
              )
            )}
            {fillerRows.map((_, index) => {
              const rowIndex = data.items.length + index
              return (
                <tr key={`filler-${index}`} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  {hasDiscountColumn && <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>}
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-auto pt-4">
          {/* Totals */}
          <div className="flex justify-end mb-3">
            <div className="w-64">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-[18px] font-extrabold text-black">Subtotal:</span>
                <span className="text-[18px] font-extrabold text-black">JMD {calculatedSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[18px] font-extrabold text-[#FF6B00]">Total:</span>
                <span className="text-[18px] font-extrabold text-[#FF6B00]">JMD {calculatedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Contract Type / Schedule / Timeline — 3 boxes matching sample image */}
          <div className="grid grid-cols-3 gap-0 mb-3 border border-gray-300 rounded-md overflow-hidden">
            {/* Contract Type — dark navy */}
            <div className="bg-[#1a1a2e] px-3 py-2 text-center">
              <p className="text-gray-400 text-[9px] font-semibold uppercase tracking-widest mb-0.5">Contract Type</p>
              <p className="text-white font-extrabold text-[13px] uppercase leading-tight">{contractType}</p>
            </div>
            {/* Schedule — orange tint */}
            <div className="bg-orange-50 border-x border-gray-300 px-3 py-2 text-center">
              <p className="text-[#FF6B00] text-[9px] font-semibold uppercase tracking-widest mb-0.5">Schedule</p>
              <p className="text-[#FF6B00] font-extrabold text-[13px] capitalize leading-tight">{scheduleLabel}</p>
            </div>
            {/* Timeline — green tint */}
            <div className="bg-green-50 border border-green-200 px-3 py-2 text-center">
              <p className="text-green-700 text-[9px] font-semibold uppercase tracking-widest mb-0.5">Timeline</p>
              <p className="text-green-700 font-extrabold text-[13px] leading-tight">{data.timeline || '3 Days'}</p>
            </div>
          </div>

          {/* Scope of Work */}
          {(scopeDef || data.scopeOfWork) && (
            <div className="border border-[#00BFFF] rounded-md px-4 py-3 mb-3">
              <h3 className="font-extrabold text-[#00BFFF] text-[11px] uppercase tracking-[0.18em] mb-2">
                Scope of Work
              </h3>
              {scopeDef && (
                <>
                  <p className="font-bold text-[#FF6B00] text-[11px] mb-2">{scopeDef.intro}</p>
                  {/* 2-column numbered list */}
                  <div className="grid grid-cols-2 gap-x-6">
                    <ol className="list-none space-y-0.5">
                      {scopeDef.points.slice(0, 8).map((pt, i) => (
                        <li key={i} className="text-[10.5px] text-gray-700 leading-snug">
                          <span className="font-semibold">{i + 1}.</span> {pt}
                        </li>
                      ))}
                    </ol>
                    <ol className="list-none space-y-0.5">
                      {scopeDef.points.slice(8).map((pt, i) => (
                        <li key={i} className="text-[10.5px] text-gray-700 leading-snug">
                          <span className="font-semibold">{i + 9}.</span> {pt}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
              {data.scopeOfWork && !scopeDef && (
                <>
                  <p className="font-bold text-[#FF6B00] text-[11px] mb-2">
                    {data.scopeOfWorkPoints && data.scopeOfWorkPoints.length > 0 
                      ? `Our ${data.scopeOfWorkPoints.length} Point Servicing Method Includes But Is Not Limited To:` 
                      : data.scopeOfWork}
                  </p>
                  {data.scopeOfWorkPoints && data.scopeOfWorkPoints.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-6">
                      <ol className="list-none space-y-0.5">
                        {data.scopeOfWorkPoints.slice(0, Math.ceil(data.scopeOfWorkPoints.length / 2)).map((pt, i) => (
                          <li key={i} className="text-[10.5px] text-gray-700 leading-snug">
                            <span className="font-semibold">{i + 1}.</span> {pt}
                          </li>
                        ))}
                      </ol>
                      <ol className="list-none space-y-0.5">
                        {data.scopeOfWorkPoints.slice(Math.ceil(data.scopeOfWorkPoints.length / 2)).map((pt, i) => (
                          <li key={i} className="text-[10.5px] text-gray-700 leading-snug">
                            <span className="font-semibold">{i + Math.ceil((data.scopeOfWorkPoints?.length || 0) / 2) + 1}.</span> {pt}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="text-[10.5px] text-gray-700 leading-snug whitespace-pre-line">{data.scopeOfWork}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Banking Details */}
          <div className="border-2 border-[#FF6B00] rounded-lg px-4 py-3 mb-3 bg-white">
            <h3 className="font-bold text-[#A14C1F] text-center uppercase tracking-[0.22em] mb-2 text-[15px]">Banking Details</h3>
            <div className="h-px bg-[#FF6B00] mb-2" />
            <div className="text-[12px] leading-[1.1] space-y-0.5">
              {bankingDetails.map((detail) => (
                <p key={detail.label} className="flex gap-1">
                  <span className="w-[150px] shrink-0 font-extrabold text-[#A14C1F]">{detail.label}:</span>
                  <span className="text-slate-700">{detail.value}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00] mb-3" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative overflow-hidden rounded bg-gray-50" style={{ height: '145px' }}>
              <img src="/images/1.jpeg" alt="ARK Kitchen Exhaust Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            <div className="relative overflow-hidden rounded bg-gray-50" style={{ height: '145px' }}>
              <img src="/images/2.jpeg" alt="ARK AC Servicing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] leading-none text-[#2563EB] font-bold tracking-[0.22em] mb-0.5">+ OUR PROFESSIONAL SERVICES +</p>
            <p className="text-[9px] leading-none whitespace-nowrap">
              <span className="font-bold text-[#FF6B00]">AIR COND./REFRIGERATION:</span>
              <span className="text-gray-500"> SALES + SERVICE + REPAIR + INSTALLATION | </span>
              <span className="font-bold text-[#2563EB]">KITCHEN EXHAUST:</span>
              <span className="text-gray-500"> FABRICATION + MAINTENANCE + REPAIRS</span>
            </p>
            <p className="text-[9px] leading-none whitespace-nowrap mb-1">
              <span className="font-bold text-[#FF6B00]">KITCHEN EQUIPMENT:</span>
              <span className="text-gray-500"> CLEANING + REPAIRS + SALES | </span>
              <span className="font-bold text-[#2563EB]">DEEP CLEANING:</span>
              <span className="text-gray-500"> DE-GREASING + DE-SCALING</span>
            </p>
            <p className="text-[9px] leading-none text-gray-600 whitespace-nowrap">
              Thank you for choosing Ark Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd &middot; www.arkmaintenance.com
            </p>
          </div>
        </div>
      </div>
    )
  }
)

QuotationTemplate.displayName = 'QuotationTemplate'
