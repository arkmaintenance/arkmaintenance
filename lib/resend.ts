import { Resend } from 'resend'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email - should be from your verified domain
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'admin@arkmaintenance.com'
export const COMPANY_NAME = 'ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.'

// Admin email for receiving form submissions (Get Quote, Contact, Join Team)
export const ADMIN_RECIPIENT_EMAIL = 'admin@arkmaintenance.com'
