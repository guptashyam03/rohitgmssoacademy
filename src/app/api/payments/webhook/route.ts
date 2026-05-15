import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const orderId = payment.order_id

    const order = await prisma.order.findFirst({ where: { razorpayOrderId: orderId } })
    if (order && order.status !== 'PAID') {
      await prisma.$transaction(async tx => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID', razorpayPaymentId: payment.id },
        })
        // Avoid duplicate grants on webhook replays
        const existing = await tx.accessGrant.findFirst({
          where: { userId: order.userId, planId: order.planId },
        })
        if (existing) {
          await tx.accessGrant.update({ where: { id: existing.id }, data: { isActive: true } })
        } else {
          await tx.accessGrant.create({ data: { userId: order.userId, planId: order.planId, isActive: true } })
        }
      })
    }
  }

  return NextResponse.json({ received: true })
}
