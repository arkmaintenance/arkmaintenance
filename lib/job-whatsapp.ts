export interface JobWhatsAppLineItem {
  description: string
  quantity?: number | null
  unit_price?: number | null
}

export interface JobWhatsAppPayload {
  phone?: string | null
  title: string
  clientName?: string | null
  contactPerson?: string | null
  scheduledDate?: string | null
  scheduledTime?: string | null
  address?: string | null
  technicianName?: string | null
  status?: string | null
  description?: string | null
  lineItems?: JobWhatsAppLineItem[]
}

function cleanText(value: string | null | undefined) {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function formatDate(value: string | null | undefined) {
  const normalizedValue = cleanText(value)
  if (!normalizedValue) return ''

  return new Date(`${normalizedValue}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(value: string | null | undefined) {
  const normalizedValue = cleanText(value)
  if (!normalizedValue) return ''

  const [hours = '0', minutes = '0'] = normalizedValue.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatLabel(value: string | null | undefined) {
  const normalizedValue = cleanText(value)
  if (!normalizedValue) return ''

  return normalizedValue.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function normalizeWhatsAppNumber(phone: string | null | undefined) {
  const digits = cleanText(phone).replace(/\D/g, '').replace(/^00/, '')

  if (!digits) return ''
  if (digits.length === 7) return `1876${digits}`
  if (digits.length === 10 && digits.startsWith('876')) return `1${digits}`

  return digits
}

function isMobileWhatsAppTarget() {
  if (typeof navigator === 'undefined') return false

  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function buildWhatsAppSendUrl(message: string, phone?: string | null) {
  const normalizedPhone = normalizeWhatsAppNumber(phone)
  const encodedMessage = encodeURIComponent(message)
  const baseUrl = isMobileWhatsAppTarget()
    ? 'https://api.whatsapp.com/send'
    : 'https://web.whatsapp.com/send'
  const params = [`text=${encodedMessage}`]

  if (normalizedPhone) {
    params.unshift(`phone=${normalizedPhone}`)
    params.push('type=phone_number', 'app_absent=0')
  }

  return `${baseUrl}?${params.join('&')}`
}

export function buildJobWhatsAppMessage(payload: JobWhatsAppPayload) {
  const greetingTarget = cleanText(payload.contactPerson) || cleanText(payload.clientName) || 'Client'
  const title = cleanText(payload.title) || 'Job'
  const scheduledDate = formatDate(payload.scheduledDate)
  const scheduledTime = formatTime(payload.scheduledTime)
  const address = cleanText(payload.address)
  const technicianName = cleanText(payload.technicianName)
  const status = formatLabel(payload.status)
  const description = cleanText(payload.description)
  const lineItems = (payload.lineItems || [])
    .map((item) => {
      const itemDescription = cleanText(item.description)
      if (!itemDescription) return ''

      const quantity = Number(item.quantity ?? 0)
      return quantity > 0 ? `- ${itemDescription} x${quantity}` : `- ${itemDescription}`
    })
    .filter(Boolean)

  const lines = [
    `Hello ${greetingTarget},`,
    '',
    'ARK Maintenance has prepared the following job details for you:',
    `Job: ${title}`,
  ]

  if (status) lines.push(`Status: ${status}`)
  if (scheduledDate) lines.push(`Date: ${scheduledDate}`)
  if (scheduledTime) lines.push(`Time: ${scheduledTime}`)
  if (technicianName) lines.push(`Technician: ${technicianName}`)
  if (address) lines.push(`Address: ${address}`)
  if (description) lines.push(`Notes: ${description}`)

  if (lineItems.length > 0) {
    lines.push('', 'Services:')
    lines.push(...lineItems)
  }

  lines.push('', 'Thank you.')

  return lines.join('\n')
}

export function buildJobWhatsAppUrl(payload: JobWhatsAppPayload) {
  if (!normalizeWhatsAppNumber(payload.phone)) return null

  const message = buildJobWhatsAppMessage(payload)
  return buildWhatsAppSendUrl(message, payload.phone)
}
