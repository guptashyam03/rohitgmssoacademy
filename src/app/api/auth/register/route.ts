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

  try {
    await sendVerificationOTP(email, otp)
  } catch (emailErr) {
    console.error('OTP email error:', emailErr)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      // Account exists and is verified — block re-registration
      if (existing.emailVerified) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      // Account exists but NOT verified — just resend the OTP
      await generateAndSendOTP(email)
      return NextResponse.json({ success: true }, { status: 201 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { name, email, password: hashed } })
    await generateAndSendOTP(email)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
