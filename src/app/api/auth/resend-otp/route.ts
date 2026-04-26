import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationOTP } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json())

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'No account found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.passwordResetToken.deleteMany({ where: { email } })
    await prisma.passwordResetToken.create({ data: { email, token: `VERIFY_${otp}`, expiresAt } })

    try {
      await sendVerificationOTP(email, otp)
    } catch (emailErr) {
      console.error('OTP email error:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
