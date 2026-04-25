import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const revalidate = 60

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    include: {
      contents: {
        include: { content: true },
        where: { content: { isActive: true } },
      },
    },
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
            <p className="text-gray-500">One-time purchase. Lifetime access. No subscriptions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const pdfs   = plan.contents.filter(pc => pc.content.type === 'PDF')
              const videos = plan.contents.filter(pc => pc.content.type === 'VIDEO')
              const tests  = plan.contents.filter(pc => pc.content.type === 'MOCK_TEST')
              const isPremium = plan.type === 'PREMIUM'

              return (
                <div key={plan.id} className={`rounded-2xl p-7 flex flex-col border ${isPremium ? 'bg-primary-600 border-primary-500 shadow-xl shadow-primary-900/30 scale-105' : 'bg-gray-900 border-gray-800'}`}>
                  {isPremium && (
                    <span className="self-start text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                  <p className={`text-4xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-primary-400'}`}>{formatCurrency(plan.price)}</p>
                  <p className={`text-sm mb-5 ${isPremium ? 'text-primary-100' : 'text-gray-500'}`}>one-time payment</p>

                  {plan.description && (
                    <p className={`text-sm mb-5 ${isPremium ? 'text-primary-100' : 'text-gray-400'}`}>{plan.description}</p>
                  )}

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {pdfs.length > 0 && (
                      <li className={`flex items-center gap-2 text-sm ${isPremium ? 'text-primary-100' : 'text-gray-400'}`}>
                        <CheckCircle size={15} className={isPremium ? 'text-white shrink-0' : 'text-primary-500 shrink-0'} />
                        {pdfs.length} PDF Note{pdfs.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    {videos.length > 0 && (
                      <li className={`flex items-center gap-2 text-sm ${isPremium ? 'text-primary-100' : 'text-gray-400'}`}>
                        <CheckCircle size={15} className={isPremium ? 'text-white shrink-0' : 'text-primary-500 shrink-0'} />
                        {videos.length} Video Lecture{videos.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    {tests.length > 0 && (
                      <li className={`flex items-center gap-2 text-sm ${isPremium ? 'text-primary-100' : 'text-gray-400'}`}>
                        <CheckCircle size={15} className={isPremium ? 'text-white shrink-0' : 'text-primary-500 shrink-0'} />
                        {tests.length} Mock Test{tests.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    {plan.contents.length === 0 && (
                      <li className={`text-sm ${isPremium ? 'text-primary-200' : 'text-gray-600'}`}>Content coming soon</li>
                    )}
                  </ul>

                  <div className="flex flex-col gap-2">
                    <Link href={`/plans/${plan.id}`}
                      className={`block text-center text-sm font-medium py-2 rounded-xl transition border ${isPremium ? 'text-white border-white/30 hover:bg-primary-500' : 'text-gray-300 border-gray-700 hover:bg-gray-800'}`}>
                      View Contents
                    </Link>
                    <Link href={`/checkout/${plan.id}`}
                      className={`block text-center font-semibold py-3 rounded-xl transition ${isPremium ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-primary-600 text-white hover:bg-primary-500'}`}>
                      Get {plan.name}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
