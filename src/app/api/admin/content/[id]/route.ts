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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { planIds, type, testDuration, totalMarks, passMark, negativeMarks, marksPerQuestion, instructions, ...rest } = await req.json()

    await prisma.planContent.deleteMany({ where: { contentId: params.id } })

    const content = await prisma.content.update({
      where: { id: params.id },
      data: {
        ...rest,
        plans: planIds?.length ? {
          create: planIds.map((id: string) => ({ planId: id })),
        } : undefined,
        mockTest: type === 'MOCK_TEST' ? {
          update: { duration: testDuration, totalMarks, passMark, negativeMarks, marksPerQuestion: marksPerQuestion ?? 1, instructions },
        } : undefined,
      },
    })

    return NextResponse.json(content)
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      select: { type: true, mockTest: { select: { id: true, _count: { select: { attempts: true } } } } },
    })

    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 })

    if (content.mockTest && content.mockTest._count.attempts > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${content.mockTest._count.attempts} student attempt${content.mockTest._count.attempts > 1 ? 's' : ''} exist for this test.` },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.planContent.deleteMany({ where: { contentId: params.id } })
      await tx.wishlistItem.deleteMany({ where: { contentId: params.id } })
      if (content.mockTest) {
        await tx.question.deleteMany({ where: { mockTestId: content.mockTest.id } })
        await tx.mockTest.delete({ where: { id: content.mockTest.id } })
      }
      await tx.content.delete({ where: { id: params.id } })
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}
