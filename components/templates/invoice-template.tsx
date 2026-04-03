'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

interface InvoiceItem {
  description: string
  qty: number
  unit_price: number
  amount: number
}

interface InvoiceData {
  invoice_number: string
  date: string
  payment_terms: string
  service_description: string
  client: {
    name: string
    company: string
    address: string
    city: string
    parish: string
  }
  items: InvoiceItem[]
  subtotal: number
  total: number
  balance_due: number
}

interface InvoiceTemplateProps {
  data: InvoiceData
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const minimumVisibleRows = 8
    const fillerRows = Array.from({
      length: Math.max(0, minimumVisibleRows - data.items.length),
    })

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
            <h1 className="text-3xl font-bold text-[#FF6B00]">INVOICE</h1>
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Invoice:</span> {data.invoice_number}</p>
              <p><span className="font-semibold">Date:</span> {data.date}</p>
              <p><span className="font-semibold">Payment Terms:</span> {data.payment_terms}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">BILL TO</h3>
          <p className="font-semibold">{data.client.name}</p>
          <p>{data.client.company}</p>
          <p>{data.client.address}</p>
          <p>{data.client.city}</p>
          <p>{data.client.parish}</p>
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
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="font-semibold">Subtotal:</span>
                <span>JMD {data.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 font-bold">
                <span>Total:</span>
                <span>JMD {data.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-[#FF6B00]">
                <span>Balance Due:</span>
                <span>JMD {data.balance_due.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="border-2 border-[#FF6B00] rounded p-4 mb-3 bg-white">
            <h3 className="font-bold text-[#FF6B00] text-center uppercase tracking-wide mb-3 text-sm">Banking Details</h3>
            <div className="h-px bg-[#FF6B00] mb-3" />
            <div className="space-y-1 text-sm">
              <p><span className="font-bold text-[#1a1a2e]">Bank:</span> First Global Bank</p>
              <p><span className="font-bold text-[#1a1a2e]">Branch:</span> Ocho Rios</p>
              <p><span className="font-bold text-[#1a1a2e]">Name:</span> ARK Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd.</p>
              <p><span className="font-bold text-[#1a1a2e]">Branch Code:</span> 99094</p>
              <p><span className="font-bold text-[#1a1a2e]">Account Number:</span> 99094 0006 439</p>
              <p><span className="font-bold text-[#1a1a2e]">Account Type:</span> Savings</p>
            </div>
          </div>

          {/* Footer with service images */}
          <div className="h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00] mb-3"></div>
          {/* Two service photos side by side */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '180px' }}>
              <img
                src="/images/1.jpeg"
                alt="ARK Kitchen Exhaust Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '180px' }}>
              <img
                src="/images/2.jpeg"
                alt="ARK AC Servicing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-semibold mb-1">OUR PROFESSIONAL SERVICES</p>
            <p className="text-xs text-gray-500">
              AIR COND./REFRIGERATION: SALES + SERVICE + REPAIR + INSTALLATION | KITCHEN EXHAUST: FABRICATION + MAINTENANCE + REPAIRS
            </p>
            <p className="text-xs text-gray-500 mb-2">
              KITCHEN EQUIPMENT: CLEANING + REPAIRS + SALES | DEEP CLEANING: DE-GREASING + DE-SCALING
            </p>
            <p className="text-xs text-gray-600">
              Thank you for choosing Ark Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd &middot; www.arkmaintenance.com
            </p>
          </div>
        </div>
      </div>
    )
  }
)

InvoiceTemplate.displayName = 'InvoiceTemplate'
