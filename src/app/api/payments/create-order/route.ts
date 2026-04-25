import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'
import { z } from 'zod'

const schema = z.object({
  planId:     z.string(),
  couponCode: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { planId, couponCode } = schema.parse(await req.json())
    const userId = (session.user as any).id

    const plan = await prisma.plan.findUnique({ where: { id: planId, isActive: true } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    let discountAmount = 0
    let coupon = null

    if (couponCode) {
      const found = await prisma.coupon.findFirst({
        where: {
          code:     couponCode,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })
      if (found && (found.maxUses === null || found.usedCount < found.maxUses)) {
        coupon = found
        discountAmount = coupon.isPercent
          ? (plan.price * coupon.discount) / 100
          : Math.min(coupon.discount, plan.price)
      } else {
        return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 })
      }
    }

    const finalAmount = Math.max(plan.price - discountAmount, 1)

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
    })

    const order = await prisma.order.create({
      data: {
        userId,
        planId,
        amount: finalAmount,
        discountAmount,
        razorpayOrderId: razorpayOrder.id,
        couponId: coupon?.id ?? null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      orderId:        razorpayOrder.id,
      amount:         razorpayOrder.amount,
      currency:       razorpayOrder.currency,
      planName:       plan.name,
      dbOrderId:      order.id,
      finalAmount,
      discountAmount,
    })
  } catch (err: any) {
    const msg = err?.error?.description ?? err?.message ?? JSON.stringify(err)
    console.error('create-order error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
