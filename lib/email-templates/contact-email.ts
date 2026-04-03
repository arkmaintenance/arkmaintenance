interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  service?: string
}

export function generateContactFormEmailHtml(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="background: linear-gradient(to right, #00BFFF, #FF6B00); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
  </div>

  <!-- Content -->
  <div style="background-color: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px;">
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color: white; border-radius: 8px; border: 1px solid #eee;">
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 120px;">Name:</td>
        <td style="border-bottom: 1px solid #eee;">${data.name}</td>
      </tr>
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email:</td>
        <td style="border-bottom: 1px solid #eee;">
          <a href="mailto:${data.email}" style="color: #00BFFF; text-decoration: none;">${data.email}</a>
        </td>
      </tr>
      ${
        data.phone
          ? `
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Phone:</td>
        <td style="border-bottom: 1px solid #eee;">
          <a href="tel:${data.phone}" style="color: #00BFFF; text-decoration: none;">${data.phone}</a>
        </td>
      </tr>
      `
          : ''
      }
      ${
        data.service
          ? `
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Service:</td>
        <td style="border-bottom: 1px solid #eee;">${data.service}</td>
      </tr>
      `
          : ''
      }
      ${
        data.subject
          ? `
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Subject:</td>
        <td style="border-bottom: 1px solid #eee;">${data.subject}</td>
      </tr>
      `
          : ''
      }
      <tr>
        <td style="font-weight: bold; color: #666; vertical-align: top; padding-top: 15px;">Message:</td>
        <td style="padding-top: 15px;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</div>
        </td>
      </tr>
    </table>

    <!-- Action Buttons -->
    <div style="text-align: center; margin-top: 25px;">
      <a href="mailto:${data.email}" style="display: inline-block; background-color: #00BFFF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reply to ${data.name}</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>This message was sent from the ARK Maintenance website contact form.</p>
    <p>Received at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' })}</p>
  </div>
</body>
</html>
`
}
