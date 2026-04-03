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
    const minimumVisibleRows = 14
    const fillerRows = Array.from({
      length: Math.max(0, minimumVisibleRows - data.items.length),
    })
    const calculateLineTotal = (item: InvoiceItem) => Number(item.qty || 0) * Number(item.unit_price || 0)
    const calculatedSubtotal = data.items.reduce((sum, item) => sum + calculateLineTotal(item), 0)
    const calculatedTotal = calculatedSubtotal
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
        className="bg-white text-black px-3 py-8 mx-auto font-sans w-[794px] min-h-[1123px] flex flex-col leading-[1.1] shrink-0"
        style={{ fontSize: '12px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Image
              src="/images/ark-logo.png"
              alt="ARK Maintenance"
              width={180}
              height={72}
              style={{ width: 'auto', height: '68px' }}
            />
            <div className="mt-1 text-gray-600 text-[11px] leading-[1]">
              <p>Kingston: 71 First Street, Newport Blvd.</p>
              <p>Tel: 876-514-4020 / 876-476-1748</p>
              <p>Email: admin@arkmaintenance.com</p>
              <p>www.arkmaintenance.com</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#FF6B00]">INVOICE</h1>
            <div className="mt-1 text-[12px] leading-[1]">
              <p><span className="font-semibold">Invoice:</span> {data.invoice_number}</p>
              <p><span className="font-semibold">Date:</span> {data.date}</p>
              <p><span className="font-semibold">Payment Terms:</span> {data.payment_terms}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-4 leading-[1.1]">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1.5">BILL TO</h3>
          <p className="font-semibold">{data.client.name}</p>
          <p>{data.client.company}</p>
          <p>{data.client.address}</p>
          <p>{data.client.city}</p>
          <p>{data.client.parish}</p>
        </div>

        {/* Service Description */}
        <div className="bg-[#1a1a2e] text-white py-1.5 px-4 font-bold text-center mb-3 uppercase leading-none">
          {data.service_description}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
              <th className="text-white text-left py-1.5 px-3 text-sm">#</th>
              <th className="text-white text-left py-1.5 px-3 text-sm">Description</th>
              <th className="text-white text-center py-1.5 px-3 text-sm">Qty</th>
              <th className="text-white text-right py-1.5 px-3 text-sm">Unit Price</th>
              <th className="text-white text-right py-1.5 px-3 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-1.5 px-3 border-b border-gray-200">{index + 1}</td>
                <td className="py-1.5 px-3 border-b border-gray-200">{item.description}</td>
                <td className="py-1.5 px-3 border-b border-gray-200 text-center">{item.qty}</td>
                <td className="py-1.5 px-3 border-b border-gray-200 text-right">JMD {item.unit_price.toLocaleString()}</td>
                <td className="py-1.5 px-3 border-b border-gray-200 text-right font-bold text-[#FF6B00]">JMD {calculateLineTotal(item).toLocaleString()}</td>
              </tr>
            ))}
            {fillerRows.map((_, index) => {
              const rowIndex = data.items.length + index

              return (
                <tr key={`filler-${index}`} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-1.5 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-1.5 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-1.5 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-1.5 px-3 border-b border-gray-200">&nbsp;</td>
                  <td className="py-1.5 px-3 border-b border-gray-200">&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-auto pt-1">
          {/* Totals */}
          <div className="flex justify-end mb-3">
            <div className="w-64">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-[18px] font-extrabold text-black">Subtotal:</span>
                <span className="text-[18px] font-extrabold text-black">JMD {calculatedSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-[18px] font-extrabold text-[#FF6B00]">Total:</span>
                <span className="text-[18px] font-extrabold text-[#FF6B00]">JMD {calculatedTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[18px] font-extrabold text-[#FF6B00]">Balance Due:</span>
                <span className="text-[18px] font-extrabold text-[#FF6B00]">JMD {data.balance_due.toLocaleString()}</span>
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
          {/* Two service photos side by side */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '155px' }}>
              <img
                src="/images/1.jpeg"
                alt="ARK Kitchen Exhaust Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <div className="relative flex items-center justify-center overflow-hidden rounded bg-gray-50" style={{ height: '155px' }}>
              <img
                src="/images/2.jpeg"
                alt="ARK AC Servicing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
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

InvoiceTemplate.displayName = 'InvoiceTemplate'
