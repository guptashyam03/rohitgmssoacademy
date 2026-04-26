import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { FileText, Video, ClipboardList, ArrowRight, Zap } from 'lucide-react'

export const revalidate = 60

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PDF_ONLY:       { label: 'PDF Notes',   color: 'text-blue-400',   bg: 'bg-blue-900/40',   border: 'border-blue-800' },
  MOCK_TEST_ONLY: { label: 'Mock Tests',  color: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-800' },
  PREMIUM:        { label: 'Premium',     color: 'text-primary-400',bg: 'bg-primary-900/40',border: 'border-primary-800' },
  CUSTOM:         { label: 'Custom',      color: 'text-purple-400', bg: 'bg-purple-900/40', border: 'border-purple-800' },
}

export default async function StorePage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      price: true,
      contents: {
        select: {
          content: { select: { id: true, type: true, title: true, subject: true, isActive: true } },
        },
        where: { content: { isActive: true } },
      },
    },
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 py-14">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Get access to curated study material — notes, videos, and mock tests — in one bundle.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-20 text-gray-600">No plans available yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map(plan => {
                const cfg = typeConfig[plan.type] ?? typeConfig.CUSTOM
                const activeContents = plan.contents.map(pc => pc.content)
                const pdfs   = activeContents.filter(c => c.type === 'PDF')
                const videos = activeContents.filter(c => c.type === 'VIDEO')
                const tests  = activeContents.filter(c => c.type === 'MOCK_TEST')
                const isPremium = plan.type === 'PREMIUM'

                return (
                  <div key={plan.id}
                    className={`relative bg-gray-900 rounded-2xl border ${isPremium ? 'border-primary-700 shadow-lg shadow-primary-950' : 'border-gray-800'} p-6 flex flex-col hover:border-primary-600 transition group`}>

                    {isPremium && (
                      <div className="absolute -top-3 left-6">
                        <span className="flex items-center gap-1 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          <Zap size={11} /> Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} mb-2`}>
                          {cfg.label}
                        </span>
                        <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                        {plan.description && (
                          <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-3xl font-bold text-primary-400">{formatCurrency(plan.price)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">one-time</p>
                      </div>
                    </div>

                    {/* Content breakdown */}
                    <div className="space-y-3 mb-5 flex-1">
                      {pdfs.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">
                            <FileText size={12} /> {pdfs.length} PDF Note{pdfs.length !== 1 ? 's' : ''}
                          </div>
                          <ul className="space-y-1 pl-4">
                            {pdfs.slice(0, 3).map(c => (
                              <li key={c.id} className="text-sm text-gray-300 truncate">• {c.title}</li>
                            ))}
                            {pdfs.length > 3 && (
                              <li className="text-xs text-gray-500">+{pdfs.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {videos.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 uppercase tracking-wide mb-1.5">
                            <Video size={12} /> {videos.length} Video Lecture{videos.length !== 1 ? 's' : ''}
                          </div>
                          <ul className="space-y-1 pl-4">
                            {videos.slice(0, 3).map(c => (
                              <li key={c.id} className="text-sm text-gray-300 truncate">• {c.title}</li>
                            ))}
                            {videos.length > 3 && (
                              <li className="text-xs text-gray-500">+{videos.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {tests.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1.5">
                            <ClipboardList size={12} /> {tests.length} Mock Test{tests.length !== 1 ? 's' : ''}
                          </div>
                          <ul className="space-y-1 pl-4">
                            {tests.slice(0, 3).map(c => (
                              <li key={c.id} className="text-sm text-gray-300 truncate">• {c.title}</li>
                            ))}
                            {tests.length > 3 && (
                              <li className="text-xs text-gray-500">+{tests.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {pdfs.length === 0 && videos.length === 0 && tests.length === 0 && (
                        <p className="text-sm text-gray-600">Content being added soon</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <Link href={`/checkout/${plan.id}`}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${isPremium ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'}`}>
                        Get {plan.name} <ArrowRight size={15} />
                      </Link>
                      <Link href={`/plans/${plan.id}`}
                        className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 transition">
                        Details
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-center text-xs text-gray-600 mt-10">
            Lifetime access · Secured by Razorpay · 256-bit SSL
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
