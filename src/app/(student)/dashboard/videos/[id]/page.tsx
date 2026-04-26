import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VideoPlayer from '@/components/video/VideoPlayer'
import PreviewGate from '@/components/preview/PreviewGate'

export const dynamic = 'force-dynamic'

export default async function VideoPlayerPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { preview?: string }
}) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id
  const isPreviewEntry = searchParams.preview === '1'

  const [content, userGrant] = await Promise.all([
    prisma.content.findFirst({ where: { id: params.id, type: 'VIDEO', isActive: true } }),
    prisma.accessGrant.findFirst({ where: { userId, isActive: true } }),
  ])

  if (!content) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' || !!userGrant

  const player = content.youtubeId
    ? <VideoPlayer videoId={content.youtubeId} />
    : <div className="text-center py-20 text-gray-400">Video not available yet.</div>

  return (
    <div className="max-w-4xl">
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4">
        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
        {content.subject && <p className="text-primary-400 text-sm font-medium mt-1">{content.subject}</p>}
        {content.duration && <p className="text-gray-400 text-sm mt-0.5">Duration: {content.duration}</p>}
      </div>

      {hasAccess ? player : (
        <PreviewGate contentId={params.id} contentType="video" alwaysAllow={isPreviewEntry}>
          {player}
        </PreviewGate>
      )}

      {content.description && (
        <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="font-semibold text-white mb-2">Description</h2>
          <p className="text-gray-400 text-sm whitespace-pre-line">{content.description}</p>
        </div>
      )}
    </div>
  )
}
