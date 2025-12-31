import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, username: string, verificationUrl: string) {
  const mailOptions = {
    from: `"coursioo" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">coursioo</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Welcome to Your Learning Journey</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ${username}! 👋</h2>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Thank you for signing up for coursioo! We're excited to have you on board.
                      </p>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                        Please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 30px 0;">
                            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999999; line-height: 1.6; margin: 0; font-size: 14px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                      </p>
                      
                      <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                        This link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                      <p style="color: #999999; margin: 0; font-size: 12px;">
                        © 2025 coursioo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    
return { success: true }
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, username: string, resetUrl: string) {
  const mailOptions = {
    from: `"coursioo" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">coursioo Account Security</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ${username},</h2>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        We received a request to reset your password for your coursioo account.
                      </p>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                        Click the button below to create a new password:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999999; line-height: 1.6; margin: 0; font-size: 14px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #f5576c; word-break: break-all;">${resetUrl}</a>
                      </p>
                      
                      <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                        This link will expire in 1 hour for security reasons.
                      </p>
                      
                      <!-- Warning Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                        <tr>
                          <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                              <strong>⚠️ Security Notice:</strong><br>
                              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                        Need help? Contact us at support@coursioo.com
                      </p>
                      <p style="color: #999999; margin: 0; font-size: 12px;">
                        © 2025 coursioo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    
return { success: true }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export async function sendWelcomeEmail(email: string, username: string) {
  const mailOptions = {
    from: `"coursioo" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome to coursioo! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to coursioo</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Welcome to coursioo!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hi ${username}!</h2>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Your account has been verified successfully! You're all set to start your learning journey.
                      </p>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                        Here's what you can do with coursioo:
                      </p>
                      <ul style="color: #666666; line-height: 1.8; margin: 0 0 30px 0; font-size: 15px;">
                        <li>📺 Import YouTube playlists as courses</li>
                        <li>📝 Take notes in Markdown for each video</li>
                        <li>📊 Track your learning progress</li>
                        <li>✅ Mark videos as completed</li>
                        <li>🌙 Enjoy dark mode support</li>
                      </ul>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; margin: 0; font-size: 12px;">
                        © 2025 coursioo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    
    return { success: true }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    // Don't throw error for welcome email, just log it

    return { success: false }
  }
}
