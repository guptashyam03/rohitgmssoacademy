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
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', razorpayPaymentId: payment.id },
      })
      await prisma.accessGrant.create({
        data: { userId: order.userId, planId: order.planId, isActive: true },
      })
    }
  }

  return NextResponse.json({ received: true })
}
