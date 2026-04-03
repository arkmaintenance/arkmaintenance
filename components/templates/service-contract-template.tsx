'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

interface ContractItem {
  description: string
  qty: number
  unit_price: number
  amount: number
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
}

interface ServiceContractTemplateProps {
  data: ServiceContractData
}

export const ServiceContractTemplate = forwardRef<HTMLDivElement, ServiceContractTemplateProps>(
  ({ data }, ref) => {
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
              <p className="font-semibold">2. Scope of Service</p>
              <p className="ml-4">2.1 Our 16 Point Servicing Method Includes but is not limited to:</p>
              <div className="ml-8 grid grid-cols-2 gap-1 text-xs">
                <p>a. Cleaning of Evaporator, Evaporator Coils and Evaporator Fan Motor</p>
                <p>b. Cleaning of Condenser Fan Motor, Condenser Coil, Compressor</p>
                <p>c. Checking/Cleaning of All Electrical Circuits</p>
                <p>d. Cleaning off All Electrical Corrosion</p>
                <p>e. Flushing Of The Drain</p>
                <p>f. Checking Gas Levels and Topping Up Where Required</p>
                <p>g. Cleaning and Treating of Air Filters</p>
                <p>h. Straightening of Evaporator and Condenser Coil Fins</p>
                <p>i. Checking Refrigerant (Freon) levels</p>
                <p>j. Checking Superheat and Subcooling</p>
                <p>k. Checking the Compressor Amp draw</p>
                <p>l. Checking the Indoor & Outdoor Fan Motor Amp draw</p>
                <p>m. Checking Electrical Components</p>
                <p>n. Checking Thermostat for Proper Operation</p>
                <p>o. Inspecting Overall Operation of Unit</p>
                <p>p. Recording all findings and Maintenance data</p>
              </div>
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
              {data.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 border-b border-gray-200">{index + 1}</td>
                  <td className="py-2 px-3 border-b border-gray-200">{item.description}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-center">{item.qty}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {item.unit_price.toLocaleString()}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-right">JMD {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-start">
            <div className="bg-[#1a1a2e] text-white p-3 rounded">
              <p className="text-xs"><span className="font-bold">CONTRACT TYPE:</span> {data.contract_type}</p>
              <p className="text-xs"><span className="font-bold">SCHEDULE:</span> {data.schedule_frequency}</p>
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
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold text-gray-800 mb-2">SERVICE SCHEDULE</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.service_schedule.map((schedule, index) => (
              <p key={index}><span className="font-semibold">{schedule.period}:</span> {schedule.date}</p>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">{data.schedule_frequency}</p>
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
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-semibold">Bank:</span> First Global Bank</p>
            <p><span className="font-semibold">Branch:</span> Ocho Rios</p>
            <p><span className="font-semibold">Name:</span> ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.</p>
            <p><span className="font-semibold">Branch Code:</span> 99094</p>
            <p><span className="font-semibold">Account Number:</span> 99094 0006 439</p>
            <p><span className="font-semibold">Account Type:</span> Savings</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-gradient pt-4 text-center">
          <div className="h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00] mb-4"></div>
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
