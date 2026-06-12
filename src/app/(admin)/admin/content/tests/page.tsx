import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Plus, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteContentButton from '@/components/admin/DeleteContentButton'

export const dynamic = 'force-dynamic'

export default async function AdminTestsPage() {
  const contents = await prisma.content.findMany({
    where: { type: 'MOCK_TEST' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, title: true, subject: true, isActive: true, createdAt: true,
      plans: { select: { planId: true, plan: { select: { name: true } } } },
      mockTest: { select: { totalMarks: true, duration: true, language: true, _count: { select: { questions: true } } } },
    },
  })

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mock Tests</h1>
        <Link href="/admin/content/new?type=MOCK_TEST" className="flex items-center gap-1.5 bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-500 font-medium transition">
          <Plus size={16} /> Add Test
        </Link>
      </div>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Questions</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Language</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {contents.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-500">No mock tests yet.</td></tr>
              )}
              {contents.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 text-gray-500 text-xs font-mono">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-yellow-500 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-200">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{c.mockTest?._count.questions ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-400">{c.mockTest?.duration ? `${c.mockTest.duration} min` : '-'}</td>
                  <td className="px-5 py-3">
                    {c.mockTest?.language === 'HINDI'
                      ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-300">Hindi</span>
                      : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">English</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.plans.map(p => <span key={p.planId} className="text-xs text-gray-400">{p.plan.name}</span>)}
                      {c.plans.length === 0 && <span className="text-xs text-gray-600">None</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge variant={c.isActive ? 'success' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/content/${c.id}/edit`} className="text-primary-400 hover:text-primary-300 text-xs font-medium transition">Edit</Link>
                      <DeleteContentButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
