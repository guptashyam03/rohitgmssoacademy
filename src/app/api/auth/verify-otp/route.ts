import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })

    const normalizedEmail = email.toLowerCase()

    const record = await prisma.emailVerification.findUnique({ where: { email: normalizedEmail } })
    if (!record) {
      return NextResponse.json({ error: 'No pending verification for this email. Please sign up again.' }, { status: 404 })
    }

    if (new Date() > record.expiresAt) {
      await prisma.emailVerification.delete({ where: { email: normalizedEmail } })
      return NextResponse.json({ error: 'Code has expired. Please sign up again to get a new code.' }, { status: 410 })
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      await prisma.emailVerification.delete({ where: { email: normalizedEmail } })
      return NextResponse.json({ error: 'This email is already registered. Please sign in.' }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: record.name,
          email: normalizedEmail,
          password: record.password,
          phone: record.phone,
          emailVerified: new Date(),
        },
      }),
      prisma.emailVerification.delete({ where: { email: normalizedEmail } }),
    ])

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
