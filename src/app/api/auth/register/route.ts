import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationOTP } from '@/lib/email'

const schema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
})

async function generateAndSendOTP(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.passwordResetToken.deleteMany({ where: { email } })
  await prisma.passwordResetToken.create({ data: { email, token: `VERIFY_${otp}`, expiresAt } })
  await sendVerificationOTP(email, otp)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json({ error: 'This email is already registered. Please sign in.' }, { status: 409 })
      }
      // Exists but unverified — tell user and offer to resend
      return NextResponse.json({
        error: 'This email is already registered but not yet verified. Go to the verification page to enter your code, or sign up again to resend it.',
        unverified: true,
      }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { name, email, password: hashed } })
    try {
      await generateAndSendOTP(email)
    } catch (emailErr: any) {
      console.error('[REGISTER] OTP send failed:', emailErr?.message, emailErr?.code)
      return NextResponse.json({ error: 'Account created but failed to send verification email. Please try signing up again or contact support.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
