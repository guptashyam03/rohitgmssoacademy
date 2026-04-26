import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Video, ClipboardList, ArrowLeft, CheckCircle, Lock, PlayCircle } from 'lucide-react'

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

  // Free preview items — first of each type in this plan
  const previewPdfId   = pdfs[0]?.id
  const previewVideoId = videos[0]?.id
  const previewTestId  = tests[0]?.id

  const hasFreePreview = previewPdfId || previewVideoId || previewTestId

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition">
            <ArrowLeft size={15} /> Back to Plans
          </Link>

          {/* Plan header */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-4">
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

          {/* Access summary */}
          <div className="bg-primary-950/40 border border-primary-900/60 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-primary-300 mb-3">Purchasing this plan gives you access to:</p>
            <div className="flex flex-wrap gap-4">
              {[
                { show: pdfs.length > 0,   icon: FileText,     color: 'text-blue-400',   label: `${pdfs.length} PDF Note${pdfs.length !== 1 ? 's' : ''}` },
                { show: videos.length > 0, icon: Video,        color: 'text-green-400',  label: `${videos.length} Video Lecture${videos.length !== 1 ? 's' : ''}` },
                { show: tests.length > 0,  icon: ClipboardList,color: 'text-yellow-400', label: `${tests.length} Mock Test${tests.length !== 1 ? 's' : ''}` },
              ].filter(i => i.show).map(({ icon: Icon, color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-primary-400 shrink-0" />
                  <Icon size={14} className={`${color} shrink-0`} />
                  <span className="text-sm text-gray-200">{label}</span>
                </div>
              ))}
              {plan.contents.length === 0 && (
                <p className="text-sm text-gray-500">Content is being added to this plan.</p>
              )}
            </div>
          </div>

          {/* Try before you buy */}
          {hasFreePreview && (
            <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <PlayCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-300 mb-1">Try before you buy</p>
                  <p className="text-sm text-yellow-200/70 mb-3">
                    Get free access to one sample of each content type in this plan — no payment needed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previewPdfId && (
                      <Link href={`/dashboard/pdfs/${previewPdfId}?preview=1`}
                        className="flex items-center gap-1.5 bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-900 transition">
                        <FileText size={12} /> Try 1 PDF free
                      </Link>
                    )}
                    {previewVideoId && (
                      <Link href={`/dashboard/videos/${previewVideoId}?preview=1`}
                        className="flex items-center gap-1.5 bg-green-900/50 border border-green-800 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-900 transition">
                        <Video size={12} /> Try 1 Video free
                      </Link>
                    )}
                    {previewTestId && (
                      <Link href={`/dashboard/tests/${previewTestId}?preview=1`}
                        className="flex items-center gap-1.5 bg-yellow-900/50 border border-yellow-800 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-900 transition">
                        <ClipboardList size={12} /> Try 1 Mock Test free
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content lists */}
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
                  {pdfs.map((c, i) => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <FileText size={15} className="text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                      {i === 0 ? (
                        <Link href={`/dashboard/pdfs/${c.id}?preview=1`}
                          className="shrink-0 text-xs font-semibold bg-blue-900/50 border border-blue-800 text-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-900 transition">
                          Free Preview
                        </Link>
                      ) : (
                        <Lock size={13} className="text-gray-600 shrink-0" />
                      )}
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
                  {videos.map((c, i) => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <Video size={15} className="text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{c.title}</p>
                        {c.duration && <p className="text-xs text-gray-500">{c.duration}</p>}
                      </div>
                      {i === 0 ? (
                        <Link href={`/dashboard/videos/${c.id}?preview=1`}
                          className="shrink-0 text-xs font-semibold bg-green-900/50 border border-green-800 text-green-300 px-2.5 py-1 rounded-lg hover:bg-green-900 transition">
                          Free Preview
                        </Link>
                      ) : (
                        <Lock size={13} className="text-gray-600 shrink-0" />
                      )}
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
                  {tests.map((c, i) => (
                    <li key={c.id} className="py-3 flex items-center gap-3">
                      <ClipboardList size={15} className="text-yellow-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{c.title}</p>
                        {c.subject && <p className="text-xs text-gray-500">{c.subject}</p>}
                      </div>
                      {i === 0 ? (
                        <Link href={`/dashboard/tests/${c.id}?preview=1`}
                          className="shrink-0 text-xs font-semibold bg-yellow-900/50 border border-yellow-800 text-yellow-300 px-2.5 py-1 rounded-lg hover:bg-yellow-900 transition">
                          Free Preview
                        </Link>
                      ) : (
                        <Lock size={13} className="text-gray-600 shrink-0" />
                      )}
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
