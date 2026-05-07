import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data: any = {}
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.discount !== undefined) data.discount = body.discount
    if (body.isPercent !== undefined) data.isPercent = body.isPercent
    if (body.maxUses !== undefined) data.maxUses = body.maxUses
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

    const coupon = await prisma.coupon.update({ where: { id: params.id }, data })
    return NextResponse.json(coupon)
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // Check if coupon has been used in any orders before deleting
    const usedInOrders = await prisma.order.count({ where: { couponId: params.id } })
    if (usedInOrders > 0) {
      return NextResponse.json(
        { error: `Cannot delete: coupon used in ${usedInOrders} order${usedInOrders > 1 ? 's' : ''}. Deactivate it instead.` },
        { status: 400 }
      )
    }
    await prisma.coupon.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
