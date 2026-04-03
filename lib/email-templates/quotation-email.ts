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

/**
 * Generate a simple, clean notification email for quotation delivery
 * The full quotation details are attached as a PDF
 */
export function generateQuotationEmailHtml(data: QuotationEmailData, customMessage?: string): string {
  const clientFirstName = data.client.name.split(' ')[0]

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
          Quotation ${data.quote_number}
        </h1>
        
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
          Dear ${clientFirstName},
        </p>
        
        ${customMessage ? `
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
          ${customMessage}
        </p>
        ` : ''}
        
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 25px 0;">
          Thank you for your interest in our services. Please find attached your quotation for <strong>${data.service_description}</strong>. 
          We look forward to the opportunity to work with you.
        </p>
        
        <!-- Quotation Summary Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 25px;">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Quotation Number</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong style="color: #1a1a2e; font-size: 14px;">${data.quote_number}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Date</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong style="color: #1a1a2e; font-size: 14px;">${data.date}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Payment Terms</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong style="color: #1a1a2e; font-size: 14px;">${data.payment_terms}</strong>
                  </td>
                </tr>
                ${data.timeline ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Timeline</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong style="color: #1a1a2e; font-size: 14px;">${data.timeline}</strong>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0 0 0;">
                    <span style="color: #FF6B00; font-size: 16px; font-weight: 600;">Total Quote</span>
                  </td>
                  <td style="padding: 12px 0 0 0; text-align: right;">
                    <strong style="color: #FF6B00; font-size: 20px;">JMD ${data.total.toLocaleString()}</strong>
                  </td>
                </tr>
              </table>
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
