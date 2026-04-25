import ContentForm from '@/components/admin/ContentForm'
import { prisma } from '@/lib/prisma'

export default async function NewContentPage({ searchParams }: { searchParams: { type?: string } }) {
  const plans = await prisma.plan.findMany({ where: { isActive: true } })
  const type = (searchParams.type || 'PDF') as 'PDF' | 'VIDEO' | 'MOCK_TEST'

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add {type.replace('_', ' ')}</h1>
      <ContentForm type={type} plans={plans} />
    </div>
  )
}
