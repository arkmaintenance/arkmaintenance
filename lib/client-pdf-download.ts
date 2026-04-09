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

function createPdfBlobUrl(pdfBase64: string) {
  const byteCharacters = atob(pdfBase64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index)
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' })

  return URL.createObjectURL(blob)
}

function triggerPdfPrint(pdfBase64: string) {
  const pdfUrl = createPdfBlobUrl(pdfBase64)
  const iframe = document.createElement('iframe')

  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = pdfUrl

  const cleanup = () => {
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
      iframe.remove()
    }, 1000)
  }

  iframe.onload = () => {
    const printWindow = iframe.contentWindow

    if (!printWindow) {
      cleanup()
      return
    }

    printWindow.focus()
    printWindow.print()
    cleanup()
  }

  document.body.appendChild(iframe)
}

export async function downloadInvoicePdf(
  invoiceData: Record<string, unknown>,
  filename?: string
) {
  const result = await generatePdf('/api/generate-invoice-pdf', { invoiceData })
  triggerPdfDownload(result.pdfBase64, filename || result.filename)
}

export async function printInvoicePdf(invoiceData: Record<string, unknown>) {
  const result = await generatePdf('/api/generate-invoice-pdf', { invoiceData })
  triggerPdfPrint(result.pdfBase64)
}

export async function downloadQuotationPdf(
  quotationData: Record<string, unknown>,
  filename?: string
) {
  const result = await generatePdf('/api/generate-quotation-pdf', { quotationData })
  triggerPdfDownload(result.pdfBase64, filename || result.filename)
}

export async function downloadServiceContractPdf(
  serviceContractData: unknown,
  filename?: string
) {
  const result = await generateServiceContractPdf(serviceContractData)
  triggerPdfDownload(result.pdfBase64, filename || result.filename)
}

export async function generateServiceContractPdf(serviceContractData: unknown) {
  return generatePdf('/api/generate-service-contract-pdf', { serviceContractData })
}

export async function printServiceContractPdf(serviceContractData: unknown) {
  const result = await generateServiceContractPdf(serviceContractData)
  triggerPdfPrint(result.pdfBase64)
}
