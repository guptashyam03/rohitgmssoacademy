import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, BarChart2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TestsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const grants = await prisma.accessGrant.findMany({
    where: { userId, isActive: true },
    include: {
      plan: {
        include: {
          contents: {
            include: {
              content: {
                include: { mockTest: { include: { _count: { select: { questions: true } } } } },
              },
            },
            where: { content: { type: 'MOCK_TEST' } },
          },
        },
      },
    },
  })

  const tests = Array.from(
    new Map(
      grants.flatMap(g => g.plan.contents.map(pc => pc.content)).map(c => [c.id, c])
    ).values()
  )

  const attempts = await prisma.testAttempt.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    include: { mockTest: { include: { content: true } } },
  })

  const attemptsByTest = attempts.reduce<Record<string, typeof attempts>>((acc, a) => {
    const key = a.mockTestId
    acc[key] = acc[key] ? [...acc[key], a] : [a]
    return acc
  }, {})

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mock Tests</h1>
        <p className="text-gray-500 text-sm mt-1">{tests.length} test{tests.length !== 1 ? 's' : ''} available</p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-gray-500 mb-4">No tests available. Purchase a plan to access mock tests.</p>
          <Link href="/plans" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition">Browse Plans</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(content => {
            const testAttempts = content.mockTest ? (attemptsByTest[content.mockTest.id] ?? []) : []
            const best = testAttempts.length > 0
              ? testAttempts.reduce((a, b) =>
                  (a.score / a.totalMarks) > (b.score / b.totalMarks) ? a : b
                )
              : null

            return (
              <div key={content.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{content.title}</h3>
                    {content.subject && <p className="text-sm text-gray-500">{content.subject}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      {content.mockTest && (
                        <>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} /> {content.mockTest.duration} min</span>
                          <span className="text-xs text-gray-500">{content.mockTest._count.questions} questions</span>
                          <span className="text-xs text-gray-500">{content.mockTest.totalMarks} marks</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {best && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Best Score</p>
                        <p className={`text-sm font-bold ${best.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round((best.score / best.totalMarks) * 100)}%
                        </p>
                      </div>
                    )}
                    <Link href={`/dashboard/tests/${content.id}`}
                      className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-500 font-medium transition">
                      {testAttempts.length > 0 ? 'Retry' : 'Start'}
                    </Link>
                  </div>
                </div>

                {testAttempts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><BarChart2 size={12} /> {testAttempts.length} attempt{testAttempts.length !== 1 ? 's' : ''}</p>
                    <div className="flex flex-wrap gap-2">
                      {testAttempts.slice(0, 5).map((a, i) => (
                        <span key={a.id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${a.passed ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {a.passed ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          #{testAttempts.length - i}: {Math.round((a.score / a.totalMarks) * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
