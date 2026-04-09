import { NextRequest, NextResponse } from 'next/server'
import { resend, DEFAULT_FROM_EMAIL, COMPANY_NAME } from '@/lib/resend'
import { generateInvoiceEmailHtml } from '@/lib/email-templates/invoice-email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, cc, subject, invoiceData, pdfBase64, pdfFilename, customMessage, emailTitle, greetingName, emailMessage } = body

    if (!to || !invoiceData) {
      return NextResponse.json(
        { error: 'Missing required fields: to, invoiceData' },
        { status: 400 }
      )
    }

    // Generate a clean, simple notification email (PDF contains full details)
    const html = generateInvoiceEmailHtml(invoiceData, {
      title: emailTitle,
      greetingName,
      message: emailMessage || customMessage,
    })
    const emailSubject = subject || `Invoice ${invoiceData.invoice_number} from ${COMPANY_NAME}`
    const fromEmail = `${COMPANY_NAME} <${DEFAULT_FROM_EMAIL}>`

    const emailOptions: {
      from: string
      to: string | string[]
      cc?: string | string[]
      subject: string
      html: string
      attachments?: Array<{
        filename: string
        content: Buffer
      }>
    } = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html,
    }

    if (cc && ((Array.isArray(cc) && cc.length > 0) || (!Array.isArray(cc) && cc))) {
      emailOptions.cc = Array.isArray(cc) ? cc : [cc]
    }

    // Add PDF attachment - this contains the full invoice with all details
    if (pdfBase64 && pdfFilename) {
      emailOptions.attachments = [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBase64, 'base64'),
        },
      ]
    }

    const { data, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log email to database
    try {
      const supabase = await createClient()
      await supabase.from('emails').insert({
        resend_id: data?.id,
        direction: 'outgoing',
        from_email: DEFAULT_FROM_EMAIL,
        to_email: Array.isArray(to) ? to.join(', ') : to,
        subject: emailSubject,
        body_html: html,
        body_text: `Invoice ${invoiceData.invoice_number} sent to ${invoiceData.client?.name || 'client'}`,
        status: 'sent',
        email_type: 'invoice',
        related_id: invoiceData.id || null,
        attachments: pdfFilename ? [{ filename: pdfFilename }] : [],
        metadata: {
          invoice_number: invoiceData.invoice_number,
          client_name: invoiceData.client?.name,
          cc: Array.isArray(cc) ? cc : cc ? [cc] : [],
          email_title: emailTitle || null,
          greeting_name: greetingName || null,
        }
      })
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Send invoice email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
