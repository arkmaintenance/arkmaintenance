import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { readFile } from 'fs/promises'
import path from 'path'
import React from 'react'
import { ServiceContractPdfDocument } from '@/lib/pdf-templates/service-contract-react-pdf'

export const runtime = 'nodejs'

async function imageFileToDataUri(relativePath: string, mimeType: string) {
  const absolutePath = path.join(process.cwd(), 'public', relativePath)
  const fileBuffer = await readFile(absolutePath)

  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceContractData } = body

    if (!serviceContractData) {
      return NextResponse.json(
        { error: 'Missing required field: serviceContractData' },
        { status: 400 }
      )
    }

    const safeData = {
      ...serviceContractData,
      items: Array.isArray(serviceContractData.items) ? serviceContractData.items : [],
      scope_of_work_points: Array.isArray(serviceContractData.scope_of_work_points)
        ? serviceContractData.scope_of_work_points
        : [],
      service_schedule: Array.isArray(serviceContractData.service_schedule)
        ? serviceContractData.service_schedule
        : [],
      subtotal: Number(serviceContractData.subtotal) || 0,
      total: Number(serviceContractData.total) || 0,
      assets: {
        logo: await imageFileToDataUri(path.join('images', 'ark-logo.png'), 'image/png'),
        footerLeft: await imageFileToDataUri(path.join('images', 'service-contract-footer-left.png'), 'image/png'),
        footerRight: await imageFileToDataUri(path.join('images', 'service-contract-footer-right.png'), 'image/png'),
      },
    }

    const pdfBuffer = await renderToBuffer(
      React.createElement(ServiceContractPdfDocument, { data: safeData }) as any
    )

    return NextResponse.json({
      success: true,
      pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
      filename: `Service-Contract-${serviceContractData.contract_number || 'SC-0000'}.pdf`,
    })
  } catch (error) {
    console.error('Error generating service contract PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
