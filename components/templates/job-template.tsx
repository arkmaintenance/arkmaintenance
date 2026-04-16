'use client'

import Image from 'next/image'
import { forwardRef } from 'react'
import { getAddressLines } from '@/lib/address-lines'

interface JobTemplateItem {
  description: string
  quantity: number
  unit_price: number
}

interface JobTemplateData {
  job_number: string
  created_date: string
  scheduled_date: string
  scheduled_time: string
  status: string
  priority: string
  job_type: string
  title: string
  client: {
    name: string
    company: string
    address: string
    city: string
    parish: string
  }
  contact_person?: string
  telephone?: string
  technician?: string
  location?: string
  department?: string
  supplier?: string
  materials?: string
  tech_charge?: string
  recurring_schedule?: string
  is_service_contract?: boolean
  notes?: string
  items: JobTemplateItem[]
  total: number
}

interface JobTemplateProps {
  data: JobTemplateData
}

function renderValue(value?: string | null) {
  return value?.trim() || 'Not provided'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0,
  }).format(value)
}

export const JobTemplate = forwardRef<HTMLDivElement, JobTemplateProps>(({ data }, ref) => {
  const clientAddressLines = getAddressLines(data.client.address, data.client.city, data.client.parish)
  const minimumVisibleRows = 8
  const fillerRows = Array.from({
    length: Math.max(0, minimumVisibleRows - data.items.length),
  })

  return (
    <div
      ref={ref}
      className="mx-auto flex min-h-[1075px] w-[760px] shrink-0 flex-col bg-white px-3 py-8 font-sans text-black"
      style={{ fontSize: '12px' }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <Image
            src="/images/ark-logo.png"
            alt="ARK Maintenance"
            width={220}
            height={90}
            style={{ width: 'auto', height: '84px' }}
          />
        </div>
        <div className="text-right text-[11px] leading-snug text-gray-600">
          <p>Kingston: 71 First Street, Newport Blvd.</p>
          <p>Tel: 876-514-4020 / 876-476-1748</p>
          <p>Email: admin@arkmaintenance.com</p>
          <p>www.arkmaintenance.com</p>
        </div>
      </div>

      <div className="mb-3 h-px bg-gray-300" />

      <div className="mb-4 flex items-start justify-between">
        <div className="max-w-[300px]">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#1a1a2e]">PREPARED FOR</p>
          <div className="inline-block min-w-[220px] max-w-[300px] rounded-md border-2 border-[#FF6B00] bg-orange-50 px-4 py-3">
            <p className="text-[14px] font-bold text-black">{renderValue(data.client.name)}</p>
            {data.client.company ? <p className="font-semibold text-[#FF6B00]">{data.client.company}</p> : null}
            {clientAddressLines.map((line, index) => (
              <p key={`${line}-${index}`} className="text-[#FF6B00]">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="text-right">
          <h1 className="mb-2 text-4xl font-extrabold leading-none text-[#FF6B00]">JOB</h1>
          <div className="space-y-0.5 text-sm text-gray-700">
            <p><span className="font-normal text-gray-500">Reference:</span> <span className="font-bold">{data.job_number}</span></p>
            <p><span className="font-normal text-gray-500">Created:</span> <span className="font-bold">{data.created_date}</span></p>
            <p><span className="font-normal text-gray-500">Status:</span> <span className="font-bold">{data.status}</span></p>
            <p><span className="font-normal text-gray-500">Priority:</span> <span className="font-bold">{data.priority}</span></p>
            <p><span className="font-normal text-gray-500">Type:</span> <span className="font-bold">{data.job_type}</span></p>
          </div>
        </div>
      </div>

      <div className="mb-3 bg-[#1a1a2e] px-4 py-1.5 text-center text-[15px] font-bold uppercase tracking-wide leading-snug text-white">
        {renderValue(data.title)}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded border border-gray-300 bg-[#1a1a2e] px-4 py-2 text-center">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-gray-400">Date</p>
          <p className="text-[14px] font-extrabold uppercase text-white">{renderValue(data.scheduled_date)}</p>
        </div>
        <div className="rounded border border-gray-300 bg-white px-4 py-2 text-center">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-gray-500">Time</p>
          <p className="text-[14px] font-extrabold uppercase text-[#FF6B00]">{renderValue(data.scheduled_time)}</p>
        </div>
        <div className="rounded border border-gray-300 bg-[#f4fbfd] px-4 py-2 text-center">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-gray-500">Technician</p>
          <p className="text-[14px] font-extrabold uppercase text-[#14889c]">{renderValue(data.technician)}</p>
        </div>
      </div>

      <div className="mb-4 rounded-[18px] border-2 border-[#FF6B00] bg-white px-7 py-4">
        <h3 className="mb-3 text-center text-[16px] font-extrabold uppercase tracking-[0.32em] text-[#A14C1F]">WORK DETAILS</h3>
        <div className="mb-3 h-px bg-[#FF6B00]" />
        <div className="grid gap-x-6 gap-y-2 text-[13px] md:grid-cols-2">
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Company / Client:</span>
            <span className="text-slate-700">{renderValue(data.client.company || data.client.name)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Contact Person:</span>
            <span className="text-slate-700">{renderValue(data.contact_person)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">WhatsApp / Phone:</span>
            <span className="text-slate-700">{renderValue(data.telephone)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Location:</span>
            <span className="text-slate-700">{renderValue(data.location)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Department:</span>
            <span className="text-slate-700">{renderValue(data.department)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Tech Charge:</span>
            <span className="text-slate-700">{renderValue(data.tech_charge)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Supplier:</span>
            <span className="text-slate-700">{renderValue(data.supplier)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Materials:</span>
            <span className="text-slate-700">{renderValue(data.materials)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Recurring:</span>
            <span className="text-slate-700">{renderValue(data.recurring_schedule)}</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Service Contract:</span>
            <span className="text-slate-700">{data.is_service_contract ? 'Yes' : 'No'}</span>
          </p>
        </div>
      </div>

      <table className="mb-3 w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00]">
            <th className="px-3 py-1.5 text-left text-sm text-white">#</th>
            <th className="px-3 py-1.5 text-left text-sm font-bold text-white">Description</th>
            <th className="px-3 py-1.5 text-center text-sm text-white">Qty</th>
            <th className="px-3 py-1.5 text-right text-sm text-white">Unit Price</th>
            <th className="px-3 py-1.5 text-right text-sm text-white">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0)

            return (
              <tr key={`${item.description}-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border-b border-gray-200 px-3 py-1.5">{index + 1}</td>
                <td className="border-b border-gray-200 px-3 py-1.5 font-bold text-[13px]">{item.description}</td>
                <td className="border-b border-gray-200 px-3 py-1.5 text-center">{item.quantity}</td>
                <td className="border-b border-gray-200 px-3 py-1.5 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="border-b border-gray-200 px-3 py-1.5 text-right font-bold text-[#FF6B00]">{formatCurrency(lineTotal)}</td>
              </tr>
            )
          })}
          {fillerRows.map((_, index) => {
            const rowIndex = data.items.length + index

            return (
              <tr key={`filler-${index}`} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border-b border-gray-200 px-3 py-1.5">&nbsp;</td>
                <td className="border-b border-gray-200 px-3 py-1.5">&nbsp;</td>
                <td className="border-b border-gray-200 px-3 py-1.5">&nbsp;</td>
                <td className="border-b border-gray-200 px-3 py-1.5">&nbsp;</td>
                <td className="border-b border-gray-200 px-3 py-1.5">&nbsp;</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mb-4 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between border-b border-gray-200 py-1.5">
            <span className="text-[18px] font-extrabold text-[#FF6B00]">Total:</span>
            <span className="text-[18px] font-extrabold text-[#FF6B00]">{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-md border border-gray-300 bg-gray-50 px-5 py-4">
        <div className="mb-2 bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00] px-3 py-1.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-white">Job Notes</h3>
        </div>
        <div className="min-h-[180px] whitespace-pre-wrap px-1 text-[13px] leading-6 text-slate-700">
          {renderValue(data.notes)}
        </div>
      </div>

      <div className="mt-auto">
        <div className="mb-3 h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00]" />
        <div className="text-center text-xs text-gray-600">
          <p className="mb-2 font-semibold">ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd</p>
          <p>Job details prepared for dispatch, technician coordination, and client follow-up.</p>
        </div>
      </div>
    </div>
  )
})

JobTemplate.displayName = 'JobTemplate'
