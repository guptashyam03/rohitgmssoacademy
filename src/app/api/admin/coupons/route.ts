import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const existing = await prisma.coupon.findUnique({ where: { code: body.code } })
    if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })

    const coupon = await prisma.coupon.create({
      data: {
        code:      body.code,
        discount:  body.discount,
        isPercent: body.isPercent,
        maxUses:   body.maxUses ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
