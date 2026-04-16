'use client'

import Image from 'next/image'
import { forwardRef } from 'react'
import { getBankingDetails } from '@/lib/banking-details'

interface ContractItem {
  description: string
  qty: number
  unit_price: number
  amount: number
  discount?: number
}

interface ServiceSchedule {
  period: string
  date: string
}

interface ServiceContractData {
  contract_number: string
  date: string
  payment_terms: string
  service_description: string
  contract_type: string
  schedule_frequency: string
  client: {
    name: string
    company: string
    address: string
    city: string
  }
  items: ContractItem[]
  subtotal: number
  total: number
  service_schedule: ServiceSchedule[]
  customer_representative?: string
  customer_position?: string
  ark_representative: string
  ark_position: string
  scopeOfWork?: string
  scopeOfWorkPoints?: string[]
}

interface ServiceContractTemplateProps {
  data: ServiceContractData
}

export const ServiceContractTemplate = forwardRef<HTMLDivElement, ServiceContractTemplateProps>(
  ({ data }, ref) => {
    const bankingDetails = getBankingDetails(data.client.company)

    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-[800px] mx-auto font-sans" style={{ fontSize: '11px' }}>
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
            <h1 className="text-2xl font-bold text-[#00BFFF]">SERVICE CONTRACT</h1>
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Contract:</span> {data.contract_number}</p>
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
        <div className="bg-[#1a1a2e] text-white py-2 px-4 font-bold text-center mb-4 uppercase text-sm">
          {data.service_description}
        </div>

        {/* Contract Introduction */}
        <div className="mb-4 text-sm">
          <p className="mb-2">
            This Predictive Maintenance Service Contract is designed to ensure your Air Conditioning equipment runs efficiently and effectively, while prolonging its lifespan and reducing repair costs.
          </p>
        </div>

        {/* Contract Benefits */}
        <div className="bg-[#00BFFF]/10 p-4 rounded mb-4">
          <h3 className="font-bold text-[#00BFFF] mb-2">CONTRACT BENEFITS</h3>
          <p className="text-sm">
            This Service Contract entitles the customer to up to 25% discounts on repair parts and labour, as well as same day / next day emergency response at no additional cost.
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">TERMS & CONDITIONS</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-semibold">1. Definition and Interpretation</p>
              <p className="ml-4">1.1 In this Agreement, the following words and expressions shall have the following meaning:</p>
              <ul className="ml-8 list-disc">
                <li>{'"Company"'} means ARK Air Conditioning, Refrigeration & Kitchen Maintenance Limited</li>
                <li>{'"Customer"'} means {data.client.company}</li>
                <li>{'"Equipment"'} means air conditioner equipment or spare parts</li>
                <li>{'"Maintenance"'} means periodical service of the equipment</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-lg text-[#00BFFF] border-b-2 border-[#00BFFF] inline-block mb-2">2. Scope of Service</p>
              <p className="ml-4 text-[11px] font-bold text-[#FF6B00]">
                2.1 {data.scopeOfWorkPoints && data.scopeOfWorkPoints.length > 0 
                  ? `Our ${data.scopeOfWorkPoints.length} Point Servicing Method Includes But Is Not Limited To:` 
                  : (data.scopeOfWork || 'Servicing Method Includes But Is Not Limited To:')}
              </p>
              {data.scopeOfWorkPoints && data.scopeOfWorkPoints.length > 0 && (
                <div className="ml-8 grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
                  {data.scopeOfWorkPoints.map((pt, i) => (
                    <p key={i}>
                      <span className="font-semibold">{String.fromCharCode(97 + i)}.</span> {pt}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold">3. Service Hours</p>
              <p className="ml-4">3.1 Maintenance will be performed during our regular working hours, Monday through Saturday, between 8:30 am and 6pm.</p>
            </div>

            <div>
              <p className="font-semibold">4. Exclusion & Additional Services</p>
              <p className="ml-4">4.1 This Agreement does not cover parts or labour for repairs needed, and will be quoted separately.</p>
            </div>
          </div>
        </div>

        {/* Charges Table */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">CHARGES FOR GENERAL SERVICING</h3>
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
                <th className="text-white text-left py-2 px-3 text-xs">#</th>
                <th className="text-white text-left py-2 px-3 text-xs">Description</th>
                <th className="text-white text-center py-2 px-3 text-xs">Qty</th>
                <th className="text-white text-right py-2 px-3 text-xs">Unit Price</th>
                <th className="text-white text-right py-2 px-3 text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => {
                const calculatedAmount = (item.qty * item.unit_price) - (item.discount || 0);
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 border-b border-gray-200">{index + 1}</td>
                    <td className="py-2 px-3 border-b border-gray-200">{item.description}</td>
                    <td className="py-2 px-3 border-b border-gray-200 text-center">{item.qty}</td>
                    <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {item.unit_price.toLocaleString()}</td>
                    <td className="py-2 px-3 border-b border-gray-200 text-right font-bold text-[#FF6B00]">JMD {calculatedAmount.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-start">
            <div className="bg-[#1a1a2e] text-white p-3 rounded">
              <p className="text-xs font-semibold uppercase text-center"><span className="text-gray-400">CONTRACT TYPE:</span><br/><span className="text-[#00BFFF] text-base">{data.contract_type}</span></p>
            </div>
            <div className="bg-[#1a1a2e] text-white p-3 rounded">
              <p className="text-xs font-semibold uppercase text-center"><span className="text-gray-400">SCHEDULE:</span><br/><span className="text-[#FF6B00] text-base">{data.payment_terms === 'Quarterly' ? 'Quarterly' : data.schedule_frequency.split(' ')[0]}</span></p>
            </div>
            <div className="bg-[#1a1a2e] text-white p-3 rounded">
              <p className="text-xs font-semibold uppercase text-center"><span className="text-gray-400">TIMELINE:</span><br/><span className="text-emerald-400 text-base">{data.payment_terms || '1 Day'}</span></p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Subtotal: JMD {data.subtotal.toLocaleString()}</p>
              <p className="font-bold text-[#FF6B00]">Total: JMD {data.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Cost Per Servicing: JMD {data.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{data.schedule_frequency}</p>
            </div>
          </div>
        </div>

        {/* Service Schedule */}
        <div className="mb-4">
          <div className="bg-linear-to-r from-[#FF6B00] via-[#8E44AD] to-[#3498DB] px-3 py-1.5 mb-4">
            <h3 className="font-bold text-white uppercase text-[11px] tracking-wide">SERVICE SCHEDULE</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-1.5 text-xs">
            {data.service_schedule.map((schedule, index) => (
              <p key={index} className="font-bold">
                <span className="text-[#FF6B00]">{schedule.period}:</span>{' '}
                <span className="text-[#1a3a5c]">{schedule.date}</span>
              </p>
            ))}
            <p className="font-bold text-[#1a3a5c] mt-2 pt-2">{data.schedule_frequency}</p>
          </div>
        </div>

        {/* Agreement Signatures */}
        <div className="border border-gray-300 p-4 rounded mb-6">
          <h3 className="font-bold text-gray-800 mb-4">AGREEMENT SIGNATURES</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold mb-2">Signed By: Representative of {data.client.company}</p>
              <div className="border-b border-gray-400 mb-2 h-8"></div>
              <p className="text-sm">Name of Representative: {data.customer_representative || '_____________'}</p>
              <p className="text-sm">Position: {data.customer_position || '_____________'}</p>
              <p className="text-sm">Date of Agreement: _____________</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Signed By: (Rep. of ARK Air Conditioning, Refrigeration & Kitchen Maint. Ltd)</p>
              <div className="border-b border-gray-400 mb-2 h-8"></div>
              <p className="text-sm">Name of Representative: {data.ark_representative}</p>
              <p className="text-sm">Position: {data.ark_position}</p>
              <p className="text-sm">Date of Agreement: {data.date}</p>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="font-bold text-gray-800 mb-2">BANKING DETAILS</h3>
          <div className="space-y-1.5 text-sm">
            {bankingDetails.map((detail) => (
              <p key={detail.label} className="flex gap-3">
                <span className="w-[170px] shrink-0 font-semibold">{detail.label}:</span>
                <span>{detail.value}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-gradient pt-4 text-center">
          <div className="h-1 bg-linear-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00] mb-4"></div>
          <p className="text-xs text-gray-600 font-semibold mb-2">OUR PROFESSIONAL SERVICES</p>
          <p className="text-xs text-gray-500">
            AIR COND./REFRIGERATION: SALES + SERVICE + REPAIR + INSTALLATION | KITCHEN EXHAUST: FABRICATION + MAINTENANCE + REPAIRS
          </p>
          <p className="text-xs text-gray-500 mb-4">
            KITCHEN EQUIPMENT: CLEANING + REPAIRS + SALES | DEEP CLEANING: DE-GREASING + DE-SCALING
          </p>
          <p className="text-xs text-gray-600">
            Thank you for choosing Ark Air Conditioning, Refrigeration & Kitchen Maintenance Ltd · www.arkmaintenance.com
          </p>
        </div>
      </div>
    )
  }
)

ServiceContractTemplate.displayName = 'ServiceContractTemplate'
