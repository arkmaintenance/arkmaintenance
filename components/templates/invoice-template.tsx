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
  payment_method?: string     // cash | bank_transfer | cheque | credit_card
  service_description: string
  isServiceContract?: boolean
  recurringSchedule?: string
  timeline?: string
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
    const paymentMethodLabel: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      credit_card: 'Credit Card',
    }
    // British High Commission gets DIFFERENT banking details (First Global Bank)
    const isBHC = data.client.company?.toLowerCase().includes('british high commission')
    const bankingDetails = isBHC
      ? [
          { label: 'Account Name', value: 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd' },
          { label: 'Account Number', value: '9909 4000 6439 (Savings)' },
          { label: 'Name of Bank', value: 'First Global Bank' },
          { label: 'Address of Bank', value: '28-48 Barbados Avenue, Kingston 5' },
          { label: 'Sort Code', value: '99094' },
          { label: 'Swift', value: 'FILBJMKN' },
        ]
      : [
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
          <div className="text-right text-[11px] text-gray-600 leading-snug">
            <p>Kingston: 71 First Street, Newport Blvd.</p>
            <p>Tel: 876-514-4020 / 876-476-1748</p>
            <p>Email: admin@arkmaintenance.com</p>
            <p>www.arkmaintenance.com</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 mb-3" />

        {/* Header Row 2: Bill To left, Invoice title+details right */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-[#1a1a2e] tracking-widest mb-2">BILL TO</p>
            <div className="border-2 border-[#FF6B00] rounded-md px-4 py-3 bg-orange-50 min-w-[220px]">
              <p className="font-bold text-black text-[14px]">{data.client.name}</p>
              {data.client.company && <p className="text-[#FF6B00] font-semibold">{data.client.company}</p>}
              {data.client.address && <p className="text-[#FF6B00]">{data.client.address}</p>}
              {data.client.city && <p className="text-[#FF6B00]">{data.client.city}</p>}
              {data.client.parish && <p className="text-[#FF6B00]">{data.client.parish}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold text-[#FF6B00] leading-none mb-2">INVOICE</h1>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p><span className="font-normal text-gray-500">Invoice:</span> <span className="font-bold">{data.invoice_number}</span></p>
              <p><span className="font-normal text-gray-500">Date:</span> <span className="font-bold">{data.date}</span></p>
              <p><span className="font-normal text-gray-500">Payment Terms:</span> <span className="font-bold">{data.payment_terms}</span></p>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="bg-[#1a1a2e] text-white py-1.5 px-4 font-bold text-center mb-3 uppercase text-[15px] tracking-wide leading-snug">
          {data.service_description}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
              <th className="text-white text-left py-1.5 px-3 text-sm">#</th>
              <th className="text-white text-left py-1.5 px-3 text-sm font-bold">Description</th>
              <th className="text-white text-center py-1.5 px-3 text-sm">Qty</th>
              <th className="text-white text-right py-1.5 px-3 text-sm">Unit Price</th>
              <th className="text-white text-right py-1.5 px-3 text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-1.5 px-3 border-b border-gray-200">{index + 1}</td>
                <td className="py-1.5 px-3 border-b border-gray-200 font-bold text-[13px]">{item.description}</td>
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

          {/* Payment Terms box for invoices (no Schedule/Timeline - those are for quotations only) */}
          <div className="flex mb-3 border border-gray-300 rounded-md overflow-hidden">
            <div className="bg-[#1a1a2e] px-4 py-2 text-center flex-1">
              <p className="text-gray-400 text-[9px] font-semibold uppercase tracking-widest mb-0.5">Payment Terms</p>
              <p className="text-white font-extrabold text-[13px] uppercase leading-tight">{data.payment_terms || 'COD'}</p>
            </div>
          </div>

          {/* Payment Method */}
          {data.payment_method && (
            <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider shrink-0">Payment Method:</span>
              <span className="font-extrabold text-[#1a1a2e] text-[13px]">
                {paymentMethodLabel[data.payment_method] || data.payment_method}
              </span>
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
