import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PDFListClient from '@/components/pdf/PDFListClient'

export const dynamic = 'force-dynamic'

export default async function PDFsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const grants = await prisma.accessGrant.findMany({
    where: { userId, isActive: true },
    include: { plan: { include: { contents: { include: { content: true }, orderBy: { content: { createdAt: 'asc' } } } } } },
  })

  const allContent = grants.flatMap(g => g.plan.contents.map(pc => pc.content))
  const pdfs = Array.from(new Map(allContent.filter(c => c.type === 'PDF' && c.isActive).map(c => [c.id, c])).values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(c => ({ id: c.id, title: c.title, subject: c.subject, description: c.description, driveFileId: c.driveFileId }))

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">PDF Notes</h1>
        <p className="text-gray-500 text-sm mt-1">{pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} available</p>
      </div>
      <PDFListClient pdfs={pdfs} />
    </div>
  )
}
