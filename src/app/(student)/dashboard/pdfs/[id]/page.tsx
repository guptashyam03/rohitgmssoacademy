import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PDFViewer from '@/components/pdf/PDFViewer'
import PreviewGate from '@/components/preview/PreviewGate'
import { Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PDFViewerPage({
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
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">{content.title}</h1>
          {content.subject && (
            <p className="text-primary-400 text-sm font-medium mt-1">{content.subject}</p>
          )}
        </div>
        {hasAccess && content.driveFileId && (
          <a
            href={`https://drive.google.com/uc?export=download&id=${content.driveFileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shrink-0"
          >
            <Download size={15} /> Download PDF
          </a>
        )}
      </div>

      {hasAccess ? viewer : (
        <PreviewGate contentId={params.id} contentType="pdf" alwaysAllow={isPreviewEntry}>
          {viewer}
        </PreviewGate>
      )}
    </div>
  )
}
