import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Video, ClipboardList, ArrowLeft } from 'lucide-react'

export const revalidate = 60

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      contents: {
        include: { content: true },
        where: { content: { isActive: true } },
      },
    },
  })

  if (!plan) notFound()

  const pdfs   = plan.contents.filter(pc => pc.content.type === 'PDF').map(pc => pc.content)
  const videos = plan.contents.filter(pc => pc.content.type === 'VIDEO').map(pc => pc.content)
  const tests  = plan.contents.filter(pc => pc.content.type === 'MOCK_TEST').map(pc => pc.content)

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition">
            <ArrowLeft size={15} /> Back to Plans
          </Link>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-white">{plan.name}</h1>
                {plan.description && <p className="text-gray-400 mt-2">{plan.description}</p>}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary-400">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-gray-500">one-time payment · lifetime access</span>
                </div>
              </div>
              <Link href={`/checkout/${plan.id}`}
                className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-500 transition shrink-0">
                Get This Plan
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {pdfs.length > 0 && (
              <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-900/50 border border-blue-800 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-blue-400" />
                  </div>
                  <h2 className="font-semibold text-white">PDF Notes</h2>
                  <span className="ml-auto text-sm text-gray-500">{pdfs.length} file{pdfs.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className="divide-y divide-gray-800">
                  {pdfs.map(c => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <FileText size={15} className="text-blue-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {videos.length > 0 && (
              <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-900/50 border border-green-800 rounded-lg flex items-center justify-center">
                    <Video size={16} className="text-green-400" />
                  </div>
                  <h2 className="font-semibold text-white">Video Lectures</h2>
                  <span className="ml-auto text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className="divide-y divide-gray-800">
                  {videos.map(c => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <Video size={15} className="text-green-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{c.title}</p>
                        {c.duration && <p className="text-xs text-gray-500">{c.duration}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tests.length > 0 && (
              <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-yellow-900/50 border border-yellow-800 rounded-lg flex items-center justify-center">
                    <ClipboardList size={16} className="text-yellow-400" />
                  </div>
                  <h2 className="font-semibold text-white">Mock Tests</h2>
                  <span className="ml-auto text-sm text-gray-500">{tests.length} test{tests.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className="divide-y divide-gray-800">
                  {tests.map(c => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <ClipboardList size={15} className="text-yellow-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {plan.contents.length === 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
                <p className="text-gray-600">Content is being added to this plan. Check back soon.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href={`/checkout/${plan.id}`}
              className="inline-block bg-primary-600 text-white font-semibold px-10 py-3.5 rounded-xl hover:bg-primary-500 transition">
              Get {plan.name} — {formatCurrency(plan.price)}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
