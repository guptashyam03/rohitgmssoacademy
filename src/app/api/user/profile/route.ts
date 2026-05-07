import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  name:        z.string().min(1).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(100).optional(),
})

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  try {
    const body = schema.parse(await req.json())
    const data: any = {}

    if (body.name) data.name = body.name

    if (body.newPassword) {
      if (!body.currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
      if (!user?.password) return NextResponse.json({ error: 'Password change not available for Google accounts' }, { status: 400 })
      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      data.password = await bcrypt.hash(body.newPassword, 12)
    }

    if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    await prisma.user.update({ where: { id: userId }, data })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
