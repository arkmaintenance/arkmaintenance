'use client'

interface GeneratedPdfResponse {
  error?: string
  details?: string
  filename?: string
  pdfBase64?: string
}

async function generatePdf(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<{ filename: string; pdfBase64: string }> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json() as GeneratedPdfResponse

  if (!response.ok || !result.pdfBase64) {
    throw new Error(result.details || result.error || 'Failed to generate PDF')
  }

  return {
    filename: result.filename || 'document.pdf',
    pdfBase64: result.pdfBase64,
  }
}

function triggerPdfDownload(pdfBase64: string, filename: string) {
  const link = document.createElement('a')
  link.href = `data:application/pdf;base64,${pdfBase64}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function downloadInvoicePdf(
  invoiceData: Record<string, unknown>,
  filename?: string
) {
  const result = await generatePdf('/api/generate-invoice-pdf', { invoiceData })
  triggerPdfDownload(result.pdfBase64, filename || result.filename)
}

export async function downloadQuotationPdf(
  quotationData: Record<string, unknown>,
  filename?: string
) {
  const result = await generatePdf('/api/generate-quotation-pdf', { quotationData })
  triggerPdfDownload(result.pdfBase64, filename || result.filename)
}
