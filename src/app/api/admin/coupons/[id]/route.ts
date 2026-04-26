import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json(coupon)
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}
