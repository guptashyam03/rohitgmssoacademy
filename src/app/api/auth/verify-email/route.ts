import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const record = await prisma.passwordResetToken.findFirst({
      where: { email, token: `VERIFY_${otp}`, expiresAt: { gt: new Date() } },
    })

    if (!record) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

    await Promise.all([
      prisma.user.update({ where: { email }, data: { emailVerified: new Date() } }),
      prisma.passwordResetToken.delete({ where: { id: record.id } }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
