import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return success to avoid email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Delete any existing token for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: email.toLowerCase() } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: email.toLowerCase(), token, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // Always log to console so it works even without email
    console.log('\n🔑 Password reset link:\n', resetUrl, '\n')

    try {
      await sendPasswordResetEmail(email, resetUrl)
      console.log('✅ Reset email sent to', email)
    } catch (emailErr: any) {
      console.error('❌ Email send failed:', emailErr?.message ?? emailErr)
      // Don't block the response — link is logged above
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
  }
}
