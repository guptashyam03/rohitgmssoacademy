import { prisma } from '@/lib/prisma'
import PlanManager from '@/components/admin/PlanManager'

export const revalidate = 30

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: 'asc' },
    include: {
      _count: { select: { orders: true, accessGrants: true } },
      contents: { select: { contentId: true } },
    },
  })

  return (
    <div className="max-w-4xl">
      <PlanManager plans={plans} />
    </div>
  )
}
