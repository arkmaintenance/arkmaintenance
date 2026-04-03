import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotationPdfDocument } from '@/lib/pdf-templates/quotation-react-pdf'
import React from 'react'
import { readFile } from 'fs/promises'
import path from 'path'

// Ensure this runs in Node.js runtime for PDF generation
export const runtime = 'nodejs'

async function imageFileToDataUri(relativePath: string, mimeType: string) {
  const absolutePath = path.join(process.cwd(), 'public', relativePath)
  const fileBuffer = await readFile(absolutePath)

  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quotationData } = body

    if (!quotationData) {
      return NextResponse.json(
        { error: 'Missing required field: quotationData' },
        { status: 400 }
      )
    }

    // Ensure items array exists and is properly formatted
    const safeQuotationData = {
      ...quotationData,
      items: Array.isArray(quotationData.items) ? quotationData.items : [],
      subtotal: Number(quotationData.subtotal) || 0,
      total: Number(quotationData.total) || 0,
      assets: {
        logo: await imageFileToDataUri(path.join('images', 'ark-logo.png'), 'image/png'),
        footerLeft: await imageFileToDataUri(path.join('images', '1.jpeg'), 'image/jpeg'),
        footerRight: await imageFileToDataUri(path.join('images', '2.jpeg'), 'image/jpeg'),
      },
    }

    // Generate PDF using React PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotationPdfDocument, { data: safeQuotationData })
    )

    // Convert to base64
    const base64 = Buffer.from(pdfBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      pdfBase64: base64,
      filename: `Quote-${quotationData.quote_number}.pdf`,
    })
  } catch (error) {
    console.error('Error generating quotation PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
