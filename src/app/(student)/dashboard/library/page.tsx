import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FileText, Video, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const grants = await prisma.accessGrant.findMany({
    where: { userId, isActive: true },
    include: { plan: { include: { contents: { include: { content: true } } } } },
  })

  const allContent = grants.flatMap(g => g.plan.contents.map(pc => pc.content))
  const unique = Array.from(new Map(allContent.map(c => [c.id, c])).values())
  const pdfs   = unique.filter(c => c.type === 'PDF')
  const videos = unique.filter(c => c.type === 'VIDEO')
  const tests  = unique.filter(c => c.type === 'MOCK_TEST')

  if (unique.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <p className="text-gray-500 text-lg mb-4">Your library is empty.</p>
        <Link href="/plans" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-500 font-medium transition">Browse Plans</Link>
      </div>
    )
  }

  function ContentGrid({ items, type }: { items: typeof unique; type: string }) {
    const Icon = type === 'PDF' ? FileText : type === 'VIDEO' ? Video : ClipboardList
    const href = (id: string) => type === 'PDF' ? `/dashboard/pdfs/${id}` : type === 'VIDEO' ? `/dashboard/videos/${id}` : `/dashboard/tests/${id}`
    const borderHover = type === 'PDF' ? 'hover:border-blue-700' : type === 'VIDEO' ? 'hover:border-green-700' : 'hover:border-purple-700'
    const iconColor = type === 'PDF' ? 'text-blue-400' : type === 'VIDEO' ? 'text-green-400' : 'text-purple-400'

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <Link key={c.id} href={href(c.id)}
            className={`bg-gray-900 rounded-xl border border-gray-800 ${borderHover} p-4 transition flex items-center gap-3 group`}>
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={18} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition">{c.title}</p>
              {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Library</h1>
        <p className="text-gray-500 text-sm mt-1">{unique.length} item{unique.length !== 1 ? 's' : ''} available</p>
      </div>

      {pdfs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">PDF Notes</h2>
            <Badge variant="info">{pdfs.length}</Badge>
          </div>
          <ContentGrid items={pdfs} type="PDF" />
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Video size={18} className="text-green-400" />
            <h2 className="text-base font-semibold text-white">Video Lectures</h2>
            <Badge variant="success">{videos.length}</Badge>
          </div>
          <ContentGrid items={videos} type="VIDEO" />
        </section>
      )}

      {tests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-yellow-400" />
            <h2 className="text-base font-semibold text-white">Mock Tests</h2>
            <Badge variant="warning">{tests.length}</Badge>
          </div>
          <ContentGrid items={tests} type="MOCK_TEST" />
        </section>
      )}
    </div>
  )
}
