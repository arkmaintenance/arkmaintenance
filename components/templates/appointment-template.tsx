'use client'

import Image from 'next/image'
import { forwardRef } from 'react'
import { getAddressLines } from '@/lib/address-lines'

interface AppointmentTemplateData {
  appointment_number: string
  created_date: string
  scheduled_date: string
  scheduled_time: string
  status: string
  priority: string
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
  address_landmark?: string
  technician?: string
  additional_technicians?: string
  notes?: string
}

interface AppointmentTemplateProps {
  data: AppointmentTemplateData
}

function renderValue(value?: string | null) {
  return value?.trim() || 'Not provided'
}

export const AppointmentTemplate = forwardRef<HTMLDivElement, AppointmentTemplateProps>(
  ({ data }, ref) => {
    const clientAddressLines = getAddressLines(data.client.address, data.client.city, data.client.parish)

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
              {data.client.company ? (
                <p className="font-semibold text-[#FF6B00]">{data.client.company}</p>
              ) : null}
              {clientAddressLines.map((line, index) => (
                <p key={`${line}-${index}`} className="text-[#FF6B00]">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="text-right">
            <h1 className="mb-2 text-4xl font-extrabold leading-none text-[#FF6B00]">APPOINTMENT</h1>
            <div className="space-y-0.5 text-sm text-gray-700">
              <p><span className="font-normal text-gray-500">Reference:</span> <span className="font-bold">{data.appointment_number}</span></p>
              <p><span className="font-normal text-gray-500">Created:</span> <span className="font-bold">{data.created_date}</span></p>
              <p><span className="font-normal text-gray-500">Status:</span> <span className="font-bold">{data.status}</span></p>
              <p><span className="font-normal text-gray-500">Priority:</span> <span className="font-bold">{data.priority}</span></p>
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
          <h3 className="mb-3 text-center text-[16px] font-extrabold uppercase tracking-[0.32em] text-[#A14C1F]">APPOINTMENT DETAILS</h3>
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
              <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Telephone:</span>
              <span className="text-slate-700">{renderValue(data.telephone)}</span>
            </p>
            <p className="flex gap-3">
              <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Additional Techs:</span>
              <span className="text-slate-700">{renderValue(data.additional_technicians)}</span>
            </p>
            <p className="flex gap-3 md:col-span-2">
              <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Service Address:</span>
              <span className="text-slate-700">
                {[data.client.address, data.client.city, data.client.parish].filter(Boolean).join(', ') || 'Not provided'}
              </span>
            </p>
            <p className="flex gap-3 md:col-span-2">
              <span className="w-[170px] shrink-0 font-extrabold text-[#A14C1F]">Address Landmark:</span>
              <span className="text-slate-700">{renderValue(data.address_landmark)}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-md border border-gray-300 bg-gray-50 px-5 py-4">
          <div className="mb-2 bg-gradient-to-r from-[#00BFFF] via-[#FF6B00] to-[#FF6B00] px-3 py-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-white">Appointment Notes</h3>
          </div>
          <div className="min-h-[220px] whitespace-pre-wrap px-1 text-[13px] leading-6 text-slate-700">
            {renderValue(data.notes)}
          </div>
        </div>

        <div className="mt-auto">
          <div className="mb-3 h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 to-[#FF6B00]" />
          <div className="text-center text-xs text-gray-600">
            <p className="mb-2 font-semibold">ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd</p>
            <p>Appointment details prepared for dispatch, coordination, and client confirmation.</p>
          </div>
        </div>
      </div>
    )
  }
)

AppointmentTemplate.displayName = 'AppointmentTemplate'
