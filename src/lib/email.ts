import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"RohitGMSSO Academy" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your password — RohitGMSSO Academy',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#fff;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Click the button below to set a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;margin-bottom:24px;">
          Reset Password
        </a>
        <p style="color:#475569;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;" />
        <p style="color:#334155;font-size:12px;">RohitGMSSO Academy</p>
      </div>
    `,
  })
}
