import { NextRequest, NextResponse } from 'next/server'
import { resend, DEFAULT_FROM_EMAIL, COMPANY_NAME, ADMIN_RECIPIENT_EMAIL } from '@/lib/resend'
import { generateJoinTeamEmailHtml } from '@/lib/email-templates/join-team-email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, position, skills, experience, message, resumeBase64, resumeFilename } = body

    // Accept either position or skills field from form
    const positionOrSkills = position || skills || 'Part-Time Technician'

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    const html = generateJoinTeamEmailHtml({
      name,
      email,
      phone,
      position: positionOrSkills,
      experience,
      message,
    })

    const emailSubject = `Job Application: ${positionOrSkills} - ${name}`

    const emailOptions: {
      from: string
      to: string[]
      replyTo: string
      subject: string
      html: string
      attachments?: Array<{
        filename: string
        content: Buffer
      }>
    } = {
      from: `${COMPANY_NAME} Careers <${DEFAULT_FROM_EMAIL}>`,
      to: [ADMIN_RECIPIENT_EMAIL],
      replyTo: email,
      subject: emailSubject,
      html,
    }

    // Add resume attachment if provided
    if (resumeBase64 && resumeFilename) {
      emailOptions.attachments = [
        {
          filename: resumeFilename,
          content: Buffer.from(resumeBase64, 'base64'),
        },
      ]
    }

    const { data, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log job application email to database
    try {
      const supabase = await createClient()
      await supabase.from('emails').insert({
        resend_id: data?.id,
        direction: 'incoming',
        from_email: email,
        to_email: ADMIN_RECIPIENT_EMAIL,
        subject: emailSubject,
        body_html: html,
        body_text: message || `Job application for ${positionOrSkills}`,
        status: 'sent',
        email_type: 'job_application',
        attachments: resumeFilename ? [{ filename: resumeFilename }] : [],
        metadata: { name, phone, position: positionOrSkills, experience }
      })
    } catch (dbError) {
      console.error('Failed to log email to database:', dbError)
    }

    // Save application to applications table
    try {
      const supabase = await createClient()
      const skillsArray = positionOrSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
      await supabase.from('applications').insert({
        name,
        email,
        phone: phone || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        message: message || null,
        resume_filename: resumeFilename || null,
        status: 'new'
      })
    } catch (dbError) {
      console.error('Failed to save application to database:', dbError)
    }

    // Send confirmation email to the applicant
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00BFFF;">Thank You for Your Application!</h2>
        <p>Dear ${name},</p>
        <p>We have received your application for the <strong>${positionOrSkills}</strong> position.</p>
        <p>Our team will review your application and get back to you if your qualifications match our requirements.</p>
        <p>Thank you for your interest in joining the ARK Maintenance team!</p>
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
      subject: `Application Received - ${positionOrSkills} at ${COMPANY_NAME}`,
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
        subject: `Application Received - ${positionOrSkills} at ${COMPANY_NAME}`,
        body_html: confirmationHtml,
        body_text: `Thank you for your application for the ${positionOrSkills} position.`,
        status: 'sent',
        email_type: 'job_application',
        metadata: { name, position: positionOrSkills, type: 'confirmation' }
      })
    } catch (dbError) {
      console.error('Failed to log confirmation email to database:', dbError)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Join team error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
