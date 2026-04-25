import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookOpen, ClipboardList, ShoppingBag, TrendingUp, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [grants, attempts, recentOrders] = await Promise.all([
    prisma.accessGrant.findMany({
      where: { userId, isActive: true },
      include: { plan: true },
    }),
    prisma.testAttempt.findMany({
      where: { userId },
      include: { mockTest: { include: { content: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId, status: 'PAID' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + (b.score / b.totalMarks) * 100, 0) / attempts.length)
    : null

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-primary-400">{session!.user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your learning overview.</p>
      </div>

      {/* Bento stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/library"
          className="col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-primary-700 transition group">
          <div className="w-10 h-10 bg-primary-900/60 border border-primary-800 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag size={20} className="text-primary-400" />
          </div>
          <p className="text-3xl font-bold text-white">{grants.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Plans</p>
        </Link>

        <Link href="/dashboard/tests"
          className="col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-purple-700 transition group">
          <div className="w-10 h-10 bg-purple-900/60 border border-purple-800 rounded-xl flex items-center justify-center mb-3">
            <ClipboardList size={20} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{attempts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Tests Taken</p>
        </Link>

        <Link href="/dashboard/tests"
          className="col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-green-700 transition group">
          <div className="w-10 h-10 bg-green-900/60 border border-green-800 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{avgScore !== null ? `${avgScore}%` : '—'}</p>
          <p className="text-sm text-gray-500 mt-1">Avg Score</p>
        </Link>

        <Link href="/store"
          className="col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 border border-primary-700 rounded-2xl p-5 hover:from-primary-500 transition flex flex-col justify-between">
          <BookOpen size={20} className="text-primary-200" />
          <div>
            <p className="text-sm font-semibold text-white">Browse Store</p>
            <p className="text-xs text-primary-200 flex items-center gap-1 mt-1">Explore content <ArrowRight size={12} /></p>
          </div>
        </Link>
      </div>

      {/* Main bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Plans */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Active Plans</h2>
            <Link href="/dashboard/library" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {grants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-3">No active plans yet.</p>
              <Link href="/plans" className="text-primary-400 text-sm font-medium hover:text-primary-300">Browse Plans →</Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {grants.map(g => (
                <li key={g.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-800/50 rounded-xl">
                  <span className="text-sm font-medium text-gray-200">{g.plan.name}</span>
                  {g.expiresAt ? (
                    <span className="text-xs text-gray-500">Expires {formatDate(g.expiresAt)}</span>
                  ) : (
                    <span className="text-xs text-green-400 font-medium bg-green-900/30 px-2 py-0.5 rounded-full">Lifetime</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Test Attempts */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Test Attempts</h2>
            <Link href="/dashboard/tests" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-3">No tests taken yet.</p>
              <Link href="/dashboard/tests" className="text-primary-400 text-sm font-medium hover:text-primary-300">Browse Tests →</Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {attempts.map(a => (
                <li key={a.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    {a.passed
                      ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                      : <XCircle size={14} className="text-red-400 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{a.mockTest.content.title}</p>
                      <p className="text-xs text-gray-600">{formatDate(a.submittedAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-2 ${a.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round((a.score / a.totalMarks) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/pdfs', label: 'PDF Notes', desc: 'View your study materials', icon: BookOpen, color: 'blue' },
          { href: '/dashboard/videos', label: 'Video Lectures', desc: 'Continue learning', icon: ClipboardList, color: 'green' },
          { href: '/dashboard/tests', label: 'Mock Tests', desc: 'Practice & improve', icon: TrendingUp, color: 'purple' },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition flex items-center justify-between group">
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={18} className="text-gray-600 group-hover:text-primary-400 transition" />
          </Link>
        ))}
      </div>
    </div>
  )
}
