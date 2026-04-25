import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { planId, couponCode } = await req.json()
    const userId = (session.user as any).id

    const plan = await prisma.plan.findUnique({ where: { id: planId, isActive: true } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    let discountAmount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code:     couponCode,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })
      if (coupon && (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)) {
        discountAmount = coupon.isPercent
          ? (plan.price * coupon.discount) / 100
          : Math.min(coupon.discount, plan.price)
        couponId = coupon.id
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    const finalAmount = plan.price - discountAmount
    if (finalAmount > 0) return NextResponse.json({ error: 'Plan is not free' }, { status: 400 })

    await prisma.$transaction([
      prisma.order.create({
        data: { userId, planId, amount: 0, discountAmount, status: 'PAID', couponId },
      }),
      prisma.accessGrant.upsert({
        where:  { id: `${userId}_${planId}` },
        update: { isActive: true },
        create: { id: `${userId}_${planId}`, userId, planId, isActive: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Free checkout failed' }, { status: 500 })
  }
}
