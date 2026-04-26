import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const callerRole = (session?.user as any)?.role
  if (!session || callerRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = patchSchema.parse(await req.json())

    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Prevent demoting the last ADMIN
    if (body.role && user.role === 'ADMIN' && body.role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the only admin' }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { ...(body.role !== undefined && { role: body.role }) },
      select: { id: true, role: true },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const callerRole = (session?.user as any)?.role
  if (!session || callerRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only admin' }, { status: 400 })
      }
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
