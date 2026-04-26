import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import MockTestClient from '@/components/tests/MockTestClient'
import PreviewGate from '@/components/preview/PreviewGate'

export const dynamic = 'force-dynamic'

export default async function MockTestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [content, userGrant] = await Promise.all([
    prisma.content.findFirst({
      where: { id: params.id, type: 'MOCK_TEST', isActive: true },
      include: { mockTest: { include: { questions: { orderBy: { order: 'asc' } } } } },
    }),
    prisma.accessGrant.findFirst({ where: { userId, isActive: true } }),
  ])

  if (!content || !content.mockTest) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' || !!userGrant

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

  const testComponent = <MockTestClient mockTest={mockTest} contentTitle={content.title} />

  return (
    <div className="max-w-4xl">
      <div className="mb-4 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4">
        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
        {content.subject && <p className="text-primary-400 text-sm font-medium mt-1">{content.subject}</p>}
      </div>

      {hasAccess ? testComponent : (
        <PreviewGate contentId={params.id} contentType="test">{testComponent}</PreviewGate>
      )}
    </div>
  )
}
