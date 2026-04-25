import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import PDFViewer from '@/components/pdf/PDFViewer'

export const dynamic = 'force-dynamic'

export default async function PDFViewerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const content = await prisma.content.findFirst({
    where: { id: params.id, type: 'PDF', isActive: true },
    include: { plans: { include: { plan: { include: { accessGrants: { where: { userId, isActive: true } } } } } } },
  })

  if (!content) notFound()

  const hasAccess = (session!.user as any).role === 'ADMIN' ||
    content.plans.some(pc => pc.plan.accessGrants.length > 0)

  if (!hasAccess) redirect('/plans')

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
        {content.subject && <p className="text-gray-500 text-sm">{content.subject}</p>}
      </div>

      {content.driveFileId ? (
        <PDFViewer fileId={content.driveFileId} />
      ) : (
        <div className="text-center py-20 text-gray-400">PDF not available yet.</div>
      )}
    </div>
  )
}
