import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { couponCode, planId } = await req.json()
    if (!couponCode || !planId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const plan = await prisma.plan.findUnique({ where: { id: planId, isActive: true } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const coupon = await prisma.coupon.findFirst({
      where: {
        code:     couponCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!coupon || (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 })
    }

    const discountAmount = coupon.isPercent
      ? (plan.price * coupon.discount) / 100
      : Math.min(coupon.discount, plan.price)

    const finalAmount = Math.max(plan.price - discountAmount, 1)

    return NextResponse.json({
      valid:          true,
      discountAmount,
      finalAmount,
      originalPrice:  plan.price,
      discountLabel:  coupon.isPercent ? `${coupon.discount}% off` : `₹${coupon.discount} off`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
