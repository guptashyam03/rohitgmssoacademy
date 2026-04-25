import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import VideoPlayer from '@/components/video/VideoPlayer'

export const dynamic = 'force-dynamic'

export default async function VideoPlayerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const content = await prisma.content.findFirst({
    where: { id: params.id, type: 'VIDEO', isActive: true },
    include: { plans: { include: { plan: { include: { accessGrants: { where: { userId, isActive: true } } } } } } },
  })

  if (!content) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' ||
    content.plans.some(pc => pc.plan.accessGrants.length > 0)

  if (!hasAccess) redirect('/plans')

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
        {content.subject && <p className="text-gray-500 text-sm">{content.subject}</p>}
        {content.duration && <p className="text-gray-400 text-sm">Duration: {content.duration}</p>}
      </div>

      {content.youtubeId ? (
        <VideoPlayer videoId={content.youtubeId} />
      ) : (
        <div className="text-center py-20 text-gray-400">Video not available yet.</div>
      )}

      {content.description && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-600 text-sm whitespace-pre-line">{content.description}</p>
        </div>
      )}
    </div>
  )
}
