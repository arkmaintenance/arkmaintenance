'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount?: number
  amount: number
}

interface QuotationData {
  quote_number: string
  date: string
  payment_terms: string
  service_description: string
  timeline?: string
  client: {
    name: string
    company: string
    address: string
    city: string
  }
  items: QuotationItem[]
  subtotal: number
  total: number
}

interface QuotationTemplateProps {
  data: QuotationData
}

export const QuotationTemplate = forwardRef<HTMLDivElement, QuotationTemplateProps>(
  ({ data }, ref) => {
    const hasDiscountColumn = data.items.some(item => item.discount)
    const minimumVisibleRows = data.timeline ? 6 : 8
    const fillerRows = Array.from({
      length: Math.max(0, minimumVisibleRows - data.items.length),
    })
    const bankingDetails = [
      { label: 'Bank', value: 'First Global Bank' },
      { label: 'Branch', value: 'Ocho Rios' },
      { label: 'Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.' },
      { label: 'Branch Code', value: '99094' },
      { label: 'Account Number', value: '99094 0006 439' },
      { label: 'Account Type', value: 'Savings' },
    ]

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-[800px] mx-auto font-sans min-h-[1120px] flex flex-col"
        style={{ fontSize: '12px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={180}
              height={72}
              style={{ width: 'auto', height: '60px' }}
            />
            <div className="mt-2 text-gray-600 text-xs">
              <p>Kingston: 71 First Street, Newport Blvd.</p>
              <p>Tel: 876-514-4020 / 876-476-1748</p>
              <p>Email: admin@arkmaintenance.com</p>
              <p>www.arkmaintenance.com</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#FF6B00]">QUOTATION</h1>
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Quotation:</span> {data.quote_number}</p>
              <p><span className="font-semibold">Date:</span> {data.date}</p>
              <p><span className="font-semibold">Payment Terms:</span> {data.payment_terms}</p>
            </div>
          </div>
        </div>

        {/* Prepared For */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">PREPARED FOR</h3>
          <p className="font-semibold">{data.client.name}</p>
          <p>{data.client.company}</p>
          <p>{data.client.address}</p>
          <p>{data.client.city}</p>
        </div>

        {/* Service Description */}
        <div className="bg-[#1a1a2e] text-white py-2 px-4 font-bold text-center mb-4 uppercase">
          {data.service_description}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
              <th className="text-white text-left py-2 px-3 text-sm">#</th>
              <th className="text-white text-left py-2 px-3 text-sm">Description</th>
              <th className="text-white text-center py-2 px-3 text-sm">Qty</th>
              <th className="text-white text-right py-2 px-3 text-sm">Unit Price</th>
              {hasDiscountColumn && (
                <th className="text-white text-right py-2 px-3 text-sm">Discount</th>
              )}
              <th className="text-white text-right py-2 px-3 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-3 border-b border-gray-200">{index + 1}</td>
                <td className="py-2 px-3 border-b border-gray-200">{item.description}</td>
                <td className="py-2 px-3 border-b border-gray-200 text-center">{item.qty}</td>
                <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {item.unit_price.toLocaleString()}</td>
                {hasDiscountColumn && (
                  <td className="py-2 px-3 border-b border-gray-200 text-right text-red-500">
                    {item.discount ? `$ ${item.discount.toLocaleString()}` : ''}
                  </td>
                )}
                <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {item.amount.toLocaleString()}</td>
              </tr>
            ))}
            {fillerRows.map((_, index) => {
              const rowIndex = data.items.length + index

              return (
                <tr key={`filler-${index}`} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  {hasDiscountColumn && (
                    <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                  )}
                  <td className="py-2 px-3 border-b border-gray-200">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-auto pt-4">
          {/* Timeline */}
          {data.timeline && (
            <div className="bg-gray-100 p-4 rounded mb-3">
              <h3 className="font-bold text-gray-800 mb-2">TIMELINE</h3>
              <p className="text-sm">{data.timeline}</p>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-3">
            <div className="w-64">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-[18px] font-extrabold text-black">Subtotal:</span>
                <span className="text-[18px] font-extrabold text-black">JMD {data.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-[#FF6B00]">
                <span>Total:</span>
                <span>JMD {data.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

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

          {/* Footer with service images */}
          <div className="h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00] mb-3"></div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '145px' }}>
              <img
                src="/images/1.jpeg"
                alt="ARK Kitchen Exhaust Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '145px' }}>
              <img
                src="/images/2.jpeg"
                alt="ARK AC Servicing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] leading-none text-gray-600 font-semibold mb-0.5">OUR PROFESSIONAL SERVICES</p>
            <p className="text-[9px] leading-none text-gray-500 whitespace-nowrap">
              AIR COND./REFRIGERATION: SALES + SERVICE + REPAIR + INSTALLATION | KITCHEN EXHAUST: FABRICATION + MAINTENANCE + REPAIRS
            </p>
            <p className="text-[9px] leading-none text-gray-500 whitespace-nowrap mb-1">
              KITCHEN EQUIPMENT: CLEANING + REPAIRS + SALES | DEEP CLEANING: DE-GREASING + DE-SCALING
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
