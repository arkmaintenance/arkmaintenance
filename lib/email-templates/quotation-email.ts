interface QuotationEmailData {
  quote_number: string
  date: string
  payment_terms: string
  service_description: string
  timeline?: string
  client: {
    name: string
    company: string
    address: string
    city: string
  }
  items: Array<{
    description: string
    qty: number
    unit_price: number
    discount?: number
    amount: number
  }>
  subtotal: number
  total: number
}

export interface QuotationEmailContentOptions {
  title?: string
  greetingName?: string
  message?: string
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

export function getDefaultQuotationEmailContent(data: QuotationEmailData): Required<QuotationEmailContentOptions> {
  return {
    title: `Quotation ${data.quote_number}`,
    greetingName: data.client.name?.trim() || 'Client',
    message: `Thank you for your interest in our services. Please find attached your quotation for ${data.service_description}. We look forward to the opportunity to work with you.`,
  }
}

/**
 * Generate a simple, clean notification email for quotation delivery
 * The full quotation details are attached as a PDF
 */
export function generateQuotationEmailHtml(
  data: QuotationEmailData,
  optionsOrCustomMessage?: string | QuotationEmailContentOptions
): string {
  const defaults = getDefaultQuotationEmailContent(data)
  const options = typeof optionsOrCustomMessage === 'string'
    ? { message: optionsOrCustomMessage }
    : optionsOrCustomMessage || {}
  const title = (options.title || defaults.title).trim()
  const greetingName = (options.greetingName || defaults.greetingName).trim()
  const message = (options.message || defaults.message).trim()
  const clientLines = [
    data.client.name,
    data.client.company,
    data.client.address,
    data.client.city,
  ].filter(Boolean)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${data.quote_number}</title>
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
        
        <!-- Client + Quotation Summary -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0;">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 10px;">
              <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; height: 100%;">
                <p style="color: #1a1a2e; font-size: 13px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.8px;">
                  Client Details
                </p>
                ${clientLines.map((line, index) => `
                <p style="color: ${index === 0 ? '#1f2937' : '#4b5563'}; font-size: 14px; margin: 0 0 6px 0; ${index === 0 ? 'font-weight: 700;' : ''}">
                  ${escapeHtml(line)}
                </p>
                `).join('')}
              </div>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 10px;">
              <div style="background-color: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; height: 100%;">
                <p style="color: #9a3412; font-size: 13px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.8px;">
                  Quotation Summary
                </p>
                <p style="color: #4b5563; font-size: 14px; margin: 0 0 6px 0;"><strong>Quotation:</strong> ${escapeHtml(data.quote_number)}</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0 0 6px 0;"><strong>Date:</strong> ${escapeHtml(data.date)}</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0 0 6px 0;"><strong>Payment Terms:</strong> ${escapeHtml(data.payment_terms)}</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0;"><strong>Total:</strong> JMD ${data.total.toLocaleString()}</p>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Attachment Notice -->
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="24" style="vertical-align: top; padding-right: 12px;">
                <span style="font-size: 20px;">📎</span>
              </td>
              <td style="vertical-align: top;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; font-weight: 500;">
                  Your detailed quotation is attached to this email as a PDF document for your review.
                </p>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
          This quotation is valid for 30 days from the date of issue. If you have any questions or would like to proceed, 
          please don&apos;t hesitate to contact us.
        </p>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0;">
          We look forward to hearing from you!
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
