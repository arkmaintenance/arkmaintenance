import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '@/lib/pdf-templates/invoice-react-pdf'
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
    const { invoiceData } = body

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Missing required field: invoiceData' },
        { status: 400 }
      )
    }

    // Ensure items array exists and is properly formatted
    const safeInvoiceData = {
      ...invoiceData,
      items: Array.isArray(invoiceData.items) ? invoiceData.items : [],
      subtotal: Number(invoiceData.subtotal) || 0,
      total: Number(invoiceData.total) || 0,
      balance_due: Number(invoiceData.balance_due) || 0,
      assets: {
        logo: await imageFileToDataUri(path.join('images', 'ark-logo.png'), 'image/png'),
        footerLeft: await imageFileToDataUri(path.join('images', '1.jpeg'), 'image/jpeg'),
        footerRight: await imageFileToDataUri(path.join('images', '2.jpeg'), 'image/jpeg'),
      },
    }

    // Generate PDF using React PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePdfDocument, { data: safeInvoiceData })
    )

    // Convert to base64
    const base64 = Buffer.from(pdfBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      pdfBase64: base64,
      filename: `Invoice-${invoiceData.invoice_number}.pdf`,
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
