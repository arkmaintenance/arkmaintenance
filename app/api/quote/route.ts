import { NextRequest, NextResponse } from 'next/server'
import { resend, DEFAULT_FROM_EMAIL, COMPANY_NAME, ADMIN_RECIPIENT_EMAIL } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, services, message } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    const servicesText = Array.isArray(services) ? services.join(', ') : services || 'Not specified'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 30px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0;">New Quote Request</h1>
          <p style="color: #999; font-size: 14px; margin-top: 5px;">From ${COMPANY_NAME} Website</p>
        </div>
        
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #f97316; font-size: 16px; margin: 0 0 15px 0; border-bottom: 1px solid #444; padding-bottom: 10px;">Contact Information</h2>
          <p style="color: #fff; margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="color: #fff; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #00bfff;">${email}</a></p>
          <p style="color: #fff; margin: 8px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          ${company ? `<p style="color: #fff; margin: 8px 0;"><strong>Company:</strong> ${company}</p>` : ''}
        </div>
        
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #f97316; font-size: 16px; margin: 0 0 15px 0; border-bottom: 1px solid #444; padding-bottom: 10px;">Services Requested</h2>
          <p style="color: #fff; margin: 0;">${servicesText}</p>
        </div>
        
        ${message ? `
        <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #f97316; font-size: 16px; margin: 0 0 15px 0; border-bottom: 1px solid #444; padding-bottom: 10px;">Message</h2>
          <p style="color: #fff; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #444;">
          <p style="color: #666; font-size: 12px; margin: 0;">This quote request was submitted via the ARK Maintenance website.</p>
        </div>
      </div>
    `

    const emailSubject = `Quote Request: ${servicesText.substring(0, 50)}${servicesText.length > 50 ? '...' : ''} from ${name}`

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

    // Log quote request email to database
    try {
      const supabase = await createClient()
      await supabase.from('emails').insert({
        resend_id: data?.id,
        direction: 'incoming',
        from_email: email,
        to_email: ADMIN_RECIPIENT_EMAIL,
        subject: emailSubject,
        body_html: html,
        body_text: `Quote Request from ${name}\nServices: ${servicesText}\n${message || ''}`,
        status: 'sent',
        email_type: 'quotation',
        metadata: { name, phone, company, services }
      })
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError)
    }

    // Send confirmation email to the user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Thank You for Your Quote Request!</h2>
        <p>Dear ${name},</p>
        <p>We have received your quote request for the following services:</p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;"><strong>${servicesText}</strong></p>
        <p>Our team will review your request and get back to you with a detailed quote within <strong>24 hours</strong>.</p>
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
      subject: `Quote Request Received - ${COMPANY_NAME}`,
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
        subject: `Quote Request Received - ${COMPANY_NAME}`,
        body_html: confirmationHtml,
        body_text: `Thank you for your quote request. We have received your request for: ${servicesText}. We will get back to you within 24 hours.`,
        status: 'sent',
        email_type: 'quotation',
        metadata: { name, type: 'confirmation' }
      })
    } catch (dbError) {
      console.error('Failed to log confirmation email to database:', dbError)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Quote form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}
