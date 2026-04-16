import { getBankingDetails } from '@/lib/banking-details'

interface InvoiceEmailData {
  invoice_number: string
  date: string
  payment_terms: string
  service_description: string
  client: {
    name: string
    company: string
    address: string
    city: string
    parish: string
  }
  items: Array<{
    description: string
    qty: number
    unit_price: number
    amount: number
  }>
  subtotal: number
  total: number
  balance_due: number
}

export interface InvoiceEmailContentOptions {
  title?: string
  greetingName?: string
  message?: string
  attachmentNote?: string
  followUpMessage?: string
  closingMessage?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderParagraphs(message: string) {
  return message
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
          ${escapeHtml(paragraph).replace(/\n/g, '<br />')}
        </p>
        `)
    .join('')
}

function renderInlineText(message: string) {
  return escapeHtml(message).replace(/\n/g, '<br />')
}

function renderBankingDetails(companyName?: string) {
  return getBankingDetails(companyName)
    .map(
      (detail) => `
        <tr>
          <td style="width: 160px; vertical-align: top; padding: 0 12px 8px 0; color: #9a3412; font-size: 13px; font-weight: 700;">
            ${escapeHtml(detail.label)}:
          </td>
          <td style="vertical-align: top; padding: 0 0 8px 0; color: #475569; font-size: 13px;">
            ${escapeHtml(detail.value)}
          </td>
        </tr>
      `
    )
    .join('')
}

export function getDefaultInvoiceEmailContent(data: InvoiceEmailData): Required<InvoiceEmailContentOptions> {
  return {
    title: `Invoice ${data.invoice_number}`,
    greetingName: data.client.name?.trim() || 'Client',
    message: `Please find attached your invoice for ${data.service_description}. We appreciate your business and are grateful for the opportunity to serve you.`,
    attachmentNote: 'Your invoice is attached to this email as a PDF document for your records and easy printing.',
    followUpMessage: "If you have any questions about this invoice, please don't hesitate to contact us.",
    closingMessage: 'Thank you for your business!',
  }
}

/**
 * Generate a simple, clean notification email for invoice delivery
 * The full invoice details are attached as a PDF
 */
export function generateInvoiceEmailHtml(
  data: InvoiceEmailData,
  optionsOrCustomMessage?: string | InvoiceEmailContentOptions
): string {
  const defaults = getDefaultInvoiceEmailContent(data)
  const options = typeof optionsOrCustomMessage === 'string'
    ? { message: optionsOrCustomMessage }
    : optionsOrCustomMessage || {}
  const title = (options.title || defaults.title).trim()
  const greetingName = (options.greetingName || defaults.greetingName).trim()
  const message = (options.message || defaults.message).trim()
  const attachmentNote = (options.attachmentNote || defaults.attachmentNote).trim()
  const followUpMessage = (options.followUpMessage || defaults.followUpMessage).trim()
  const closingMessage = (options.closingMessage || defaults.closingMessage).trim()
  const clientLines = [
    data.client.name,
    data.client.company,
    data.client.address,
    data.client.city,
    data.client.parish,
  ].filter(Boolean)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoice_number}</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
        <img src="https://arkmaintenance.com/images/ark-logo.png" alt="ARK Maintenance" style="height: 50px; width: auto;">
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
          ${escapeHtml(title)}
        </h1>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
          Dear ${escapeHtml(greetingName)},
        </p>
        
        ${renderParagraphs(message)}
        
      

        <!-- Attachment Notice -->
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="24" style="vertical-align: top; padding-right: 12px;">
                <span style="font-size: 20px;">📎</span>
              </td>
              <td style="vertical-align: top;">
                <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 500;">
                  ${renderInlineText(attachmentNote)}
                </p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <p style="color: #9a3412; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px 0;">
            Banking Details
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${renderBankingDetails(data.client.company)}
          </table>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 10px 0;">
          ${renderInlineText(followUpMessage)}
        </p>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0;">
          ${renderInlineText(closingMessage)}
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <p style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">
                ARK Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0;">
                Kingston: 71 First Street, Newport Blvd. | Tel: 876-514-4020 / 876-476-1748
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 15px 0;">
                Email: admin@arkmaintenance.com | www.arkmaintenance.com
              </p>
              <div style="border-top: 3px solid transparent; border-image: linear-gradient(90deg, #00BFFF, #FFD700, #FF6B00) 1; padding-top: 15px;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                  &copy; ${new Date().getFullYear()} ARK Maintenance. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
