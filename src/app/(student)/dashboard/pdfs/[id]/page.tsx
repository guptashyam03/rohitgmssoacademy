import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PDFViewer from '@/components/pdf/PDFViewer'
import PreviewGate from '@/components/preview/PreviewGate'

export const dynamic = 'force-dynamic'

export default async function PDFViewerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [content, userGrant] = await Promise.all([
    prisma.content.findFirst({ where: { id: params.id, type: 'PDF', isActive: true } }),
    prisma.accessGrant.findFirst({ where: { userId, isActive: true } }),
  ])

  if (!content) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' || !!userGrant

  const viewer = content.driveFileId
    ? <PDFViewer fileId={content.driveFileId} />
    : <div className="text-center py-20 text-gray-400">PDF not available yet.</div>

  return (
    <div className="max-w-5xl">
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4">
        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
        {content.subject && (
          <p className="text-primary-400 text-sm font-medium mt-1">{content.subject}</p>
        )}
      </div>

      {hasAccess ? viewer : (
        <PreviewGate contentId={params.id} contentType="pdf">{viewer}</PreviewGate>
      )}
    </div>
  )
}
