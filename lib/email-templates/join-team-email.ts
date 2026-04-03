interface JoinTeamData {
  name: string
  email: string
  phone?: string
  position: string
  experience?: string
  message?: string
}

export function generateJoinTeamEmailHtml(data: JoinTeamData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Application</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="background: linear-gradient(to right, #00BFFF, #FF6B00); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Job Application</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Position: ${data.position}</p>
  </div>

  <!-- Content -->
  <div style="background-color: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px;">
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color: white; border-radius: 8px; border: 1px solid #eee;">
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 130px;">Applicant Name:</td>
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
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Position:</td>
        <td style="border-bottom: 1px solid #eee;">
          <span style="background-color: #00BFFF; color: white; padding: 4px 12px; border-radius: 15px; font-size: 13px;">${data.position}</span>
        </td>
      </tr>
      ${
        data.experience
          ? `
      <tr>
        <td style="border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Experience:</td>
        <td style="border-bottom: 1px solid #eee;">${data.experience}</td>
      </tr>
      `
          : ''
      }
      ${
        data.message
          ? `
      <tr>
        <td style="font-weight: bold; color: #666; vertical-align: top; padding-top: 15px;">Cover Letter:</td>
        <td style="padding-top: 15px;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</div>
        </td>
      </tr>
      `
          : ''
      }
    </table>

    <!-- Note about Resume -->
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Note:</strong> If the applicant uploaded a resume, it will be attached to this email.
      </p>
    </div>

    <!-- Action Buttons -->
    <div style="text-align: center; margin-top: 25px;">
      <a href="mailto:${data.email}?subject=Re: Your Application for ${data.position} at ARK Maintenance" style="display: inline-block; background-color: #00BFFF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact ${data.name}</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>This application was submitted through the ARK Maintenance careers page.</p>
    <p>Received at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' })}</p>
  </div>
</body>
</html>
`
}
