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

    // Track whether this is a first-time payment or a retry — only increment coupon on first payment
    const wasAlreadyPaid = order.status === 'PAID'

    await prisma.$transaction(async tx => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
        },
      })

      // Find existing grant and reactivate, or create a new one
      const existingGrant = await tx.accessGrant.findFirst({
        where: { userId, planId: order.planId },
      })
      if (existingGrant) {
        await tx.accessGrant.update({ where: { id: existingGrant.id }, data: { isActive: true } })
      } else {
        await tx.accessGrant.create({ data: { userId, planId: order.planId, isActive: true } })
      }

      // Only increment coupon usage on the first successful verification, not on retries
      if (order.couponId && !wasAlreadyPaid) {
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
