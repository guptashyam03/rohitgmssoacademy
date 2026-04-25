import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckoutClient from '@/components/checkout/CheckoutClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id

  const [plan, existingGrant] = await Promise.all([
    prisma.plan.findUnique({ where: { id: params.planId, isActive: true } }),
    prisma.accessGrant.findFirst({
      where: { userId, planId: params.planId, isActive: true },
    }),
  ])

  if (!plan) notFound()

  // Already has access — send them straight to dashboard
  if (existingGrant) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h1>
        <p className="text-gray-500 text-sm mb-8">You&apos;re just one step away from unlocking your content.</p>
        <CheckoutClient plan={{ id: plan.id, name: plan.name, price: plan.price }} />
      </div>
    </div>
  )
}
