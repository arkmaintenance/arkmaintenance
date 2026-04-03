'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

interface EmailSignatureData {
  sender_name: string
}

interface EmailSignatureTemplateProps {
  data: EmailSignatureData
}

export const EmailSignatureTemplate = forwardRef<HTMLDivElement, EmailSignatureTemplateProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="bg-[#1e1e1e] text-white p-6 max-w-[600px] font-sans">
        {/* Closing */}
        <p className="italic text-gray-300 mb-1">Kind Regards,</p>
        <p className="font-bold text-white mb-4">{data.sender_name}</p>

        {/* Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-[#00BFFF] via-yellow-400 via-[#FF6B00] to-red-500 mb-6"></div>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/ark-logo.png"
            alt="ARK Maintenance"
            width={200}
            height={80}
            style={{ width: 'auto', height: '70px' }}
          />
        </div>

        {/* Tagline */}
        <p className="text-center text-gray-400 text-sm mb-4">
          Professional HVAC & Kitchen Maintenance Services
        </p>

        {/* Contact Info */}
        <div className="text-center text-sm space-y-1 mb-4">
          <p>
            <span className="text-[#00BFFF]">Tel:</span>{' '}
            <a href="tel:876-514-4020" className="text-[#00BFFF] hover:underline">876-514-4020</a>
            {' / '}
            <a href="tel:876-476-1748" className="text-[#00BFFF] hover:underline">876-476-1748</a>
          </p>
          <p>
            <span className="text-[#00BFFF]">Email:</span>{' '}
            <a href="mailto:admin@arkmaintenance.com" className="text-[#00BFFF] hover:underline">admin@arkmaintenance.com</a>
          </p>
          <p>
            <span className="text-[#00BFFF]">Web:</span>{' '}
            <a href="https://www.arkmaintenance.com" className="text-[#00BFFF] hover:underline">www.arkmaintenance.com</a>
          </p>
        </div>

        {/* Locations */}
        <p className="text-center text-gray-500 text-xs italic mb-4">
          Kingston: 71 First Street, Newport Blvd. | St. Ann: 109 Main Street, Ocho Rios | St. James: Ironshore, Montego Bay
        </p>

        {/* Gradient Line */}
        <div className="h-0.5 bg-gradient-to-r from-[#00BFFF] via-yellow-400 via-[#FF6B00] to-red-500 mb-4"></div>

        {/* Services */}
        <div className="flex justify-center gap-4 text-xs">
          <span className="text-[#00BFFF]">New Air Conditioners</span>
          <span className="text-gray-400 underline">AC Maintenance</span>
          <span className="text-[#FF6B00]">Kitchen Exhaust/Duct Systems</span>
          <span className="text-red-500">Kitchen Equipment Deep Cleaning</span>
        </div>
      </div>
    )
  }
)

EmailSignatureTemplate.displayName = 'EmailSignatureTemplate'
