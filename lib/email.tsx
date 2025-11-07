import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBirthdayReminder(
  userEmail: string,
  birthdayPersonName: string,
  company: string,
  birthdate: string,
) {
  const [year, month, day] = birthdate.split("-")
  const formattedDate = `${day}/${month}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Birthday Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header with gradient -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🎂 Birthday Reminder</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi there! 👋
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              This is a friendly reminder that it's time to wish <strong>${birthdayPersonName}</strong> a happy birthday!
            </p>
            
            <!-- Birthday Info Card -->
            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #667eea;">
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">Name:</span>
                <div style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 4px;">${birthdayPersonName}</div>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">Company:</span>
                <div style="color: #111827; font-size: 16px; margin-top: 4px;">${company}</div>
              </div>
              
              <div>
                <span style="color: #6b7280; font-size: 14px;">Birthday:</span>
                <div style="color: #111827; font-size: 16px; margin-top: 4px;">${formattedDate}</div>
              </div>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
              Don't forget to reach out and make their day special! 🎉
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
              Sent by Birthday Tracker App
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: userEmail,
      subject: `🎂 Birthday Reminder: ${birthdayPersonName}`,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
