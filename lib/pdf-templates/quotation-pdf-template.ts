import { getBankingDetails } from '@/lib/banking-details'

interface QuotationItem {
  description: string
  qty: number
  unit_price: number
  discount?: number
  amount: number
}

interface QuotationPdfData {
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
  items: QuotationItem[]
  subtotal: number
  total: number
}

// ARK logo URL - using company URL for PDF rendering
const ARK_LOGO_URL = 'https://arkmaintenance.com/images/ark-logo.png'

// Service images for footer - using Vercel blob URLs which work with CORS
const KITCHEN_SERVICE_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vidu-image-3160973357910227%20%281%29-Bvb5JXqm3zTHQbz0wtaAnBOVkMHiKm.png'
const AC_SERVICE_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover.jpeg-FW19ClbJksspOOP6m0p6ZndaWHefPt.webp'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function generateQuotationPdfHtml(data: QuotationPdfData): string {
  const hasDiscount = data.items.some((item) => item.discount && item.discount > 0)
  const bankingDetailsMarkup = getBankingDetails(data.client.company)
    .map(
      (detail) => `
        <div class="banking-row">
          <span class="banking-label">${escapeHtml(detail.label)}:</span>
          <span class="banking-value">${escapeHtml(detail.value)}</span>
        </div>
      `
    )
    .join('')

  const itemRows = data.items
    .map(
      (item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'};">
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">${index + 1}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; font-weight: 500;">${item.description}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #334155;">${item.qty}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #334155;">JMD ${item.unit_price.toLocaleString()}</td>
        ${hasDiscount ? `<td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #dc2626; font-weight: 500;">${item.discount ? `-JMD ${item.discount.toLocaleString()}` : ''}</td>` : ''}
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #1e293b; font-weight: 600;">JMD ${item.amount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${data.quote_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      font-size: 14px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .quotation-container {
      width: 100%;
      min-height: 100%;
      padding: 40px 16px;
      background: #ffffff;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f1f5f9;
    }
    .logo-section {
      flex: 1;
    }
    .logo {
      height: 65px;
      width: auto;
      margin-bottom: 12px;
    }
    .company-info {
      color: #64748b;
      font-size: 12px;
      line-height: 1.7;
    }
    .company-info p {
      margin: 2px 0;
    }
    .quotation-title-section {
      text-align: right;
    }
    .quotation-title {
      color: #FF6B00;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    .quotation-details {
      font-size: 13px;
      line-height: 1.8;
    }
    .quotation-details p {
      margin: 3px 0;
      color: #475569;
    }
    .quotation-details strong {
      color: #1e293b;
      font-weight: 600;
    }
    .prepared-for-section {
      margin-bottom: 28px;
    }
    .section-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #00BFFF;
      display: inline-block;
    }
    .client-info {
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
    }
    .client-info p {
      margin: 3px 0;
    }
    .client-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 16px;
    }
    .service-banner {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #ffffff;
      padding: 14px 20px;
      text-align: center;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 0.8px;
      margin-bottom: 24px;
      border-radius: 6px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .items-table thead tr {
      background: linear-gradient(90deg, #00BFFF 0%, #FF6B00 100%);
    }
    .items-table th {
      color: #ffffff;
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th.center {
      text-align: center;
    }
    .items-table th.right {
      text-align: right;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-table {
      width: 280px;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
    }
    .totals-table tr {
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-table tr:last-child {
      border-bottom: none;
    }
    .totals-table td {
      padding: 12px 16px;
      font-size: 14px;
    }
    .totals-table .label {
      font-weight: 600;
      color: #475569;
    }
    .totals-table .value {
      text-align: right;
      color: #1e293b;
      font-weight: 500;
    }
    .totals-table .total-row {
      background: linear-gradient(90deg, #FF6B00 0%, #ff8533 100%);
    }
    .totals-table .total-row td {
      color: #ffffff;
      font-weight: 700;
      font-size: 15px;
    }
    .timeline-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid #00BFFF;
    }
    .timeline-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .timeline-content {
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }
    .banking-section {
      border: 2px solid #FF6B00;
      border-radius: 18px;
      padding: 18px 26px;
      margin-bottom: 28px;
      background: #ffffff;
    }
    .banking-title {
      font-weight: 800;
      color: #A14C1F;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-size: 16px;
      margin-bottom: 14px;
    }
    .banking-divider {
      height: 1px;
      background: #FF6B00;
      margin-bottom: 14px;
    }
    .banking-rows {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .banking-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
      line-height: 1.35;
    }
    .banking-label {
      width: 210px;
      flex-shrink: 0;
      font-weight: 800;
      color: #A14C1F;
    }
    .banking-value {
      color: #475569;
      flex: 1;
    }
    .footer-section {
      margin-top: 20px;
    }
    .footer-gradient {
      height: 4px;
      background: linear-gradient(90deg, #00BFFF 0%, #FFD700 50%, #FF6B00 100%);
      border-radius: 2px;
      margin-bottom: 16px;
    }
    .service-images-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .service-image-container {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .service-image {
      width: 100%;
      height: 90px;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .footer-text {
      text-align: center;
      padding: 16px 0;
    }
    .footer-title {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .footer-services {
      font-size: 10px;
      color: #94a3b8;
      margin: 4px 0;
      line-height: 1.6;
    }
    .footer-thanks {
      font-size: 11px;
      color: #64748b;
      margin-top: 12px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="quotation-container">
    <!-- Header -->
    <div class="header-section">
      <div class="logo-section">
        <img src="${ARK_LOGO_URL}" alt="ARK Maintenance" class="logo" crossorigin="anonymous">
        <div class="company-info">
          <p><strong>Kingston:</strong> 71 First Street, Newport Blvd.</p>
          <p><strong>Tel:</strong> 876-514-4020 / 876-476-1748</p>
          <p><strong>Email:</strong> admin@arkmaintenance.com</p>
          <p><strong>Web:</strong> www.arkmaintenance.com</p>
        </div>
      </div>
      <div class="quotation-title-section">
        <h1 class="quotation-title">QUOTATION</h1>
        <div class="quotation-details">
          <p><strong>Quotation:</strong> ${data.quote_number}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Payment Terms:</strong> ${data.payment_terms}</p>
        </div>
      </div>
    </div>

    <!-- Prepared For -->
    <div class="prepared-for-section">
      <h3 class="section-title">Prepared For</h3>
      <div class="client-info">
        <p class="client-name">${data.client.name}</p>
        <p>${data.client.company}</p>
        <p>${data.client.address}</p>
        <p>${data.client.city}</p>
      </div>
    </div>

    <!-- Service Description Banner -->
    <div class="service-banner">
      ${data.service_description}
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50px;">#</th>
          <th>Description</th>
          <th class="center" style="width: 70px;">Qty</th>
          <th class="right" style="width: 110px;">Unit Price</th>
          ${hasDiscount ? '<th class="right" style="width: 90px;">Discount</th>' : ''}
          <th class="right" style="width: 110px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td class="label">Subtotal:</td>
          <td class="value">JMD ${data.subtotal.toLocaleString()}</td>
        </tr>
        <tr class="total-row">
          <td class="label">Total:</td>
          <td class="value">JMD ${data.total.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    ${data.timeline ? `
    <!-- Timeline -->
    <div class="timeline-section">
      <div class="timeline-title">Project Timeline</div>
      <div class="timeline-content">${data.timeline}</div>
    </div>
    ` : ''}

    <!-- Banking Details -->
    <div class="banking-section">
      <div class="banking-title">BANKING DETAILS</div>
      <div class="banking-divider"></div>
      <div class="banking-rows">
        ${bankingDetailsMarkup}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <div class="footer-gradient"></div>
      <div class="service-images-grid">
        <div class="service-image-container">
          <img src="${KITCHEN_SERVICE_IMAGE}" alt="ARK Kitchen Maintenance" class="service-image" crossorigin="anonymous">
        </div>
        <div class="service-image-container">
          <img src="${AC_SERVICE_IMAGE}" alt="ARK AC Servicing" class="service-image" crossorigin="anonymous">
        </div>
      </div>
      <div class="footer-text">
        <p class="footer-title">Our Professional Services</p>
        <p class="footer-services">
          AIR COND./REFRIGERATION: SALES + SERVICE + REPAIR + INSTALLATION | KITCHEN EXHAUST: FABRICATION + MAINTENANCE + REPAIRS
        </p>
        <p class="footer-services">
          KITCHEN EQUIPMENT: CLEANING + REPAIRS + SALES | DEEP CLEANING: DE-GREASING + DE-SCALING
        </p>
        <p class="footer-thanks">
          Thank you for choosing ARK Air Conditioning, Refrigeration &amp; Kitchen Maintenance Ltd.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}
