import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Users, ShoppingCart, BookOpen, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export const revalidate = 30

export default async function AdminDashboardPage() {
  const [userCount, orderCount, contentCount, revenue, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.content.count({ where: { isActive: true } }),
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      include: { user: true, plan: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const stats = [
    { label: 'Total Users',   value: userCount,                              icon: Users,       color: 'bg-blue-900/50 text-blue-400' },
    { label: 'Paid Orders',   value: orderCount,                             icon: ShoppingCart, color: 'bg-green-900/50 text-green-400' },
    { label: 'Content Items', value: contentCount,                           icon: BookOpen,    color: 'bg-purple-900/50 text-purple-400' },
    { label: 'Total Revenue', value: formatCurrency(revenue._sum.amount ?? 0), icon: TrendingUp, color: 'bg-yellow-900/50 text-yellow-400' },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3">User</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-800/50 transition">
                  <td className="py-3">
                    <p className="font-medium text-gray-200">{order.user.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </td>
                  <td className="py-3 text-gray-400">{order.plan.name}</td>
                  <td className="py-3 font-medium text-green-400">{formatCurrency(order.amount)}</td>
                  <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
