import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ContentForm from '@/components/admin/ContentForm'

export default async function EditContentPage({ params }: { params: { id: string } }) {
  const content = await prisma.content.findUnique({
    where: { id: params.id },
    include: { plans: true, mockTest: true },
  })
  if (!content) notFound()

  const plans = await prisma.plan.findMany({ where: { isActive: true } })
  const type = content.type as 'PDF' | 'VIDEO' | 'MOCK_TEST'

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit {type.replace('_', ' ')}</h1>
      <ContentForm type={type} plans={plans} initialData={content} />
    </div>
  )
}
