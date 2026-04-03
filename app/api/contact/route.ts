import { NextRequest, NextResponse } from 'next/server'
import { resend, DEFAULT_FROM_EMAIL, COMPANY_NAME, ADMIN_RECIPIENT_EMAIL } from '@/lib/resend'
import { generateContactFormEmailHtml } from '@/lib/email-templates/contact-email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, service } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      )
    }

    const html = generateContactFormEmailHtml({
      name,
      email,
      phone,
      subject,
      message,
      service,
    })

    const emailSubject = `Contact Form: ${subject || 'New Inquiry'} from ${name}`

    // Send to admin email (admin@arkmaintenance.com)
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} Website <${DEFAULT_FROM_EMAIL}>`,
      to: [ADMIN_RECIPIENT_EMAIL],
      replyTo: email,
      subject: emailSubject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log incoming contact email to database
    try {
      const supabase = await createClient()
      await supabase.from('emails').insert({
        resend_id: data?.id,
        direction: 'incoming',
        from_email: email,
        to_email: ADMIN_RECIPIENT_EMAIL,
        subject: emailSubject,
        body_html: html,
        body_text: message,
        status: 'sent',
        email_type: 'contact',
        metadata: { name, phone, service }
      })
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError)
    }

    // Send confirmation email to the user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00BFFF;">Thank You for Contacting Us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>If your inquiry is urgent, please call us at <strong>876-514-4020</strong> or <strong>876-476-1748</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          ARK Air Conditioning, Refrigeration & Kitchen Maintenance Ltd.<br />
          Kingston: 71 First Street, Newport Blvd.<br />
          www.arkmaintenance.com
        </p>
      </div>
    `

    const confirmResult = await resend.emails.send({
      from: `${COMPANY_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: [email],
      subject: `Thank you for contacting ${COMPANY_NAME}`,
      html: confirmationHtml,
    })

    // Log confirmation email to database
    try {
      const supabase = await createClient()
      await supabase.from('emails').insert({
        resend_id: confirmResult.data?.id,
        direction: 'outgoing',
        from_email: DEFAULT_FROM_EMAIL,
        to_email: email,
        subject: `Thank you for contacting ${COMPANY_NAME}`,
        body_html: confirmationHtml,
        body_text: `Thank you for contacting us. We have received your message and will get back to you soon.`,
        status: 'sent',
        email_type: 'contact',
        metadata: { name, type: 'confirmation' }
      })
    } catch (dbError) {
      console.error('Failed to log confirmation email to database:', dbError)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
