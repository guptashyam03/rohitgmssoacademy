import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminId = (session.user as any).id
  const body = await req.json()

  if (body.action === 'grant') {
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const grant = await prisma.accessGrant.create({
      data: {
        userId:    body.userId,
        planId:    body.planId,
        grantedBy: adminId,
        isActive:  true,
        expiresAt,
      },
    })
    return NextResponse.json(grant, { status: 201 })
  }

  if (body.action === 'revoke') {
    await prisma.accessGrant.update({
      where: { id: body.grantId },
      data:  { isActive: false },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
