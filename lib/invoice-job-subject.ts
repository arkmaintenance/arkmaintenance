const DEFAULT_INVOICE_SUBJECT = 'AIR CONDITIONER SERVICING AND MAINTENANCE'

function normalizeSegment(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function looksLikeDateSegment(value: string) {
  const upperValue = normalizeSegment(value).toUpperCase()

  return /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC)[A-Z]*\b/.test(upperValue)
    || /\b\d{1,2}(?:ST|ND|RD|TH)?(?:,\s*|\s+)\d{4}\b/.test(upperValue)
    || /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(upperValue)
}

interface InvoiceJobSubjectOptions {
  invoiceNumber?: string | null
  clientName?: string | null
  companyName?: string | null
}

export function getInvoiceJobSubject(
  rawTitle: string | null | undefined,
  options: InvoiceJobSubjectOptions = {},
) {
  const cleanedTitle = normalizeSegment(rawTitle || '')

  if (!cleanedTitle) {
    return DEFAULT_INVOICE_SUBJECT
  }

  const normalizedTitle = cleanedTitle.replace(/\u2013|\u2014/g, '-')
  const parts = normalizedTitle
    .split(/\s+-\s+/)
    .map(normalizeSegment)
    .filter(Boolean)

  if (parts.length <= 1) {
    return cleanedTitle
  }

  const normalizedInvoiceNumber = normalizeSegment(options.invoiceNumber || '').toUpperCase()
  const plainInvoiceNumber = normalizedInvoiceNumber.replace(/^INV-?/, '')
  const knownClients = [options.clientName, options.companyName]
    .filter(Boolean)
    .map((value) => normalizeSegment(String(value)).toUpperCase())

  const filteredParts = parts.filter((part, index) => {
    const upperPart = part.toUpperCase()
    const isFirstPart = index === 0
    const isLastPart = index === parts.length - 1

    if (isFirstPart) {
      if (upperPart.includes('INVOICE')) {
        return false
      }

      if (normalizedInvoiceNumber && (
        upperPart === normalizedInvoiceNumber
        || upperPart === plainInvoiceNumber
        || upperPart.includes(normalizedInvoiceNumber)
        || upperPart.includes(plainInvoiceNumber)
      )) {
        return false
      }
    }

    if (knownClients.includes(upperPart)) {
      return false
    }

    if (isLastPart && looksLikeDateSegment(part)) {
      return false
    }

    return true
  })

  if (filteredParts.length > 0) {
    return filteredParts.join(' - ')
  }

  return cleanedTitle
}
