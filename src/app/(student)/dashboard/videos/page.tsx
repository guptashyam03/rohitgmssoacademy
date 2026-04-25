import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Video } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const grants = await prisma.accessGrant.findMany({
    where: { userId, isActive: true },
    include: { plan: { include: { contents: { include: { content: true } } } } },
  })

  const allContent = grants.flatMap(g => g.plan.contents.map(pc => pc.content))
  const videos = Array.from(new Map(allContent.filter(c => c.type === 'VIDEO' && c.isActive).map(c => [c.id, c])).values())

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Video Lectures</h1>
        <p className="text-gray-500 text-sm mt-1">{videos.length} video{videos.length !== 1 ? 's' : ''} available</p>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-64 text-center bg-gray-900 rounded-xl border border-gray-800">
          <Video size={40} className="text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm mb-3">No video lectures available in your plans.</p>
          <Link href="/plans" className="text-primary-400 text-sm font-medium hover:text-primary-300">Browse Plans →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(c => (
            <Link key={c.id} href={`/dashboard/videos/${c.id}`}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-green-700 transition flex items-start gap-3 group">
              <div className="w-10 h-10 bg-green-900/50 border border-green-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Video size={18} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 line-clamp-2 group-hover:text-white transition">{c.title}</p>
                {c.subject && <p className="text-xs text-gray-500 mt-1">{c.subject}</p>}
                {c.duration && <p className="text-xs text-gray-500 mt-1">{c.duration}</p>}
                {c.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
