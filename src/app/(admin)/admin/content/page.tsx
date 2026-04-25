import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Plus, FileText, Video, ClipboardList, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteContentButton from '@/components/admin/DeleteContentButton'

export const revalidate = 30

const typeIcons: Record<string, any> = { PDF: FileText, VIDEO: Video, MOCK_TEST: ClipboardList, BUNDLE: Package }
const typeBadge: Record<string, any> = { PDF: 'info', VIDEO: 'success', MOCK_TEST: 'warning', BUNDLE: 'default' }

export default async function AdminContentPage() {
  const contents = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      subject: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
      plans: { select: { planId: true, plan: { select: { name: true } } } },
    },
  })

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content</h1>
        <div className="flex gap-3">
          <Link href="/admin/content/new?type=PDF" className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 font-medium transition">
            <Plus size={16} /> Add PDF
          </Link>
          <Link href="/admin/content/new?type=VIDEO" className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-500 font-medium transition">
            <Plus size={16} /> Add Video
          </Link>
          <Link href="/admin/content/new?type=MOCK_TEST" className="flex items-center gap-1.5 bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-500 font-medium transition">
            <Plus size={16} /> Add Test
          </Link>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {contents.map(c => {
                const Icon = typeIcons[c.type] ?? FileText
                return (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-gray-500 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-200">{c.title}</p>
                          {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge variant={typeBadge[c.type]}>{c.type.replace('_', ' ')}</Badge></td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
