import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name:        body.name,
        type:        body.type,
        price:       body.price,
        description: body.description || null,
        isActive:    body.isActive ?? true,
      },
    })
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // Block deletion if active access grants exist
    const activeGrants = await prisma.accessGrant.count({ where: { planId: params.id, isActive: true } })
    if (activeGrants > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${activeGrants} active access grant${activeGrants > 1 ? 's' : ''} exist for this plan. Revoke all access first.` },
        { status: 400 }
      )
    }

    // Block deletion if paid orders reference this plan
    const paidOrders = await prisma.order.count({ where: { planId: params.id, status: 'PAID' } })
    if (paidOrders > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${paidOrders} paid order${paidOrders > 1 ? 's' : ''} reference this plan. Consider deactivating it instead.` },
        { status: 400 }
      )
    }

    await prisma.plan.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
