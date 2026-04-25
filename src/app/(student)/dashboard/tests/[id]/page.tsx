import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import MockTestClient from '@/components/tests/MockTestClient'

export const dynamic = 'force-dynamic'

export default async function MockTestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const content = await prisma.content.findFirst({
    where: { id: params.id, type: 'MOCK_TEST', isActive: true },
    include: {
      mockTest: { include: { questions: { orderBy: { order: 'asc' } } } },
      plans: { include: { plan: { include: { accessGrants: { where: { userId, isActive: true } } } } } },
    },
  })

  if (!content || !content.mockTest) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' ||
    content.plans.some(pc => pc.plan.accessGrants.length > 0)

  if (!hasAccess) redirect('/plans')

  const mockTest = {
    id: content.mockTest.id,
    duration: content.mockTest.duration,
    totalMarks: content.mockTest.totalMarks,
    passMark: content.mockTest.passMark,
    negativeMarks: content.mockTest.negativeMarks,
    instructions: content.mockTest.instructions,
    questions: content.mockTest.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: q.marks,
      order: q.order,
      section: q.section,
    })),
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-1">{content.title}</h1>
      {content.subject && <p className="text-gray-500 text-sm mb-6">{content.subject}</p>}
      <MockTestClient mockTest={mockTest} contentTitle={content.title} />
    </div>
  )
}
