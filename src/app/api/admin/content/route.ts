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

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { planIds, type, testDuration, totalMarks, passMark, negativeMarks, marksPerQuestion, instructions, ...rest } = body

    const content = await prisma.content.create({
      data: {
        ...rest,
        type,
        plans: planIds?.length ? {
          create: planIds.map((id: string) => ({ planId: id })),
        } : undefined,
        mockTest: type === 'MOCK_TEST' ? {
          create: { duration: testDuration, totalMarks, passMark, negativeMarks, marksPerQuestion: marksPerQuestion ?? 1, instructions },
        } : undefined,
      },
    })

    return NextResponse.json(content, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
