import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Plus, Video } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteContentButton from '@/components/admin/DeleteContentButton'

export const revalidate = 30

export default async function AdminVideosPage() {
  const contents = await prisma.content.findMany({
    where: { type: 'VIDEO' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, subject: true, isActive: true, createdAt: true,
      plans: { select: { planId: true, plan: { select: { name: true } } } },
    },
  })

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Video Lectures</h1>
        <Link href="/admin/content/new?type=VIDEO" className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-500 font-medium transition">
          <Plus size={16} /> Add Video
        </Link>
      </div>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {contents.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No videos yet.</td></tr>
              )}
              {contents.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-green-400 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-200">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                    </div>
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
