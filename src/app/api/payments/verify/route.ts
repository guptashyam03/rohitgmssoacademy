import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { z } from 'zod'

const schema = z.object({
  razorpay_order_id:   z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature:  z.string(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = schema.parse(await req.json())
    const userId = (session.user as any).id

    const isValid = verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    )

    if (!isValid) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: body.razorpay_order_id, userId },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    await prisma.$transaction(async tx => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
        },
      })

      await tx.accessGrant.upsert({
        where: { id: `${userId}_${order.planId}` },
        create: { userId, planId: order.planId, isActive: true },
        update: { isActive: true },
      })

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
