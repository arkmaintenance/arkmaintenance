import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { readFile } from 'fs/promises'
import path from 'path'
import React from 'react'
import { ClientReportPdfDocument } from '@/lib/pdf-templates/client-report-react-pdf'

export const runtime = 'nodejs'

async function imageFileToDataUri(relativePath: string, mimeType: string) {
  const absolutePath = path.join(process.cwd(), 'public', relativePath)
  const fileBuffer = await readFile(absolutePath)

  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData } = body

    if (!reportData) {
      return NextResponse.json(
        { error: 'Missing required field: reportData' },
        { status: 400 }
      )
    }

    const safeData = {
      ...reportData,
      title: typeof reportData.title === 'string' ? reportData.title : 'Client Report',
      report_date:
        typeof reportData.report_date === 'string' ? reportData.report_date : new Date().toLocaleDateString('en-US'),
      client_name: typeof reportData.client_name === 'string' ? reportData.client_name : 'Client Name',
      contact_person:
        typeof reportData.contact_person === 'string' ? reportData.contact_person : 'Client Contact',
      address_lines: Array.isArray(reportData.address_lines) ? reportData.address_lines.filter(Boolean) : [],
      sections: Array.isArray(reportData.sections) ? reportData.sections : [],
      assets: {
        content_page_background: await imageFileToDataUri(
          path.join('images', 'client-report-template-page-1.png'),
          'image/png'
        ),
      },
    }

    const pdfBuffer = await renderToBuffer(
      React.createElement(ClientReportPdfDocument, { data: safeData }) as any
    )

    return NextResponse.json({
      success: true,
      pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
      filename: `${safeData.title}.pdf`,
    })
  } catch (error) {
    console.error('Error generating client report PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
