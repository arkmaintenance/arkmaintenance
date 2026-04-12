import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { readFile } from 'fs/promises'
import path from 'path'
import React from 'react'
import { IncidentReportPdf } from '@/lib/pdf-templates/incident-report-pdf'

export const runtime = 'nodejs'

async function imageFileToDataUri(relativePath: string, mimeType: string) {
  try {
    const absolutePath = path.join(process.cwd(), 'public', relativePath)
    const fileBuffer = await readFile(absolutePath)
    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
  } catch (e) {
    console.error(`Failed to load image: ${relativePath}`, e)
    return undefined
  }
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

    const assets = {
      logo: await imageFileToDataUri('images/ark-logo.png', 'image/png'),
      footerLeft: await imageFileToDataUri('images/service-contract-footer-left.png', 'image/png'),
      footerRight: await imageFileToDataUri('images/service-contract-footer-right.png', 'image/png'),
    }

    const pdfBuffer = await renderToBuffer(
      React.createElement(IncidentReportPdf, { data: reportData, assets })
    )

    const filename = `Incident Report - ${reportData.title} - ${reportData.report_date}.pdf`.replace(/[/\\?%*:|"<>]/g, '-')

    return NextResponse.json({
      success: true,
      pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
      filename,
    })
  } catch (error) {
    console.error('Error generating incident report PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
