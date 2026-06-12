import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationOTP } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
  phone:    z.string().min(10).max(15).optional(),
})

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone } = schema.parse(body)
    const normalizedEmail = email.toLowerCase()

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in.' }, { status: 409 })
    }

    const otp = generateOTP()
    const hashed = await bcrypt.hash(password, 12)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await prisma.emailVerification.upsert({
      where: { email: normalizedEmail },
      update: { name, phone: phone || null, password: hashed, otp, expiresAt },
      create: { email: normalizedEmail, name, phone: phone || null, password: hashed, otp, expiresAt },
    })

    await sendVerificationOTP(normalizedEmail, otp)

    return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Failed to send verification code. Please try again.' }, { status: 500 })
  }
}
