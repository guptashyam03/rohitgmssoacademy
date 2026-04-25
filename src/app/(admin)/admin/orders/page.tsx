import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export const revalidate = 30

const statusBadge: Record<string, any> = {
  PAID: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'default',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    select: {
      id: true, amount: true, discountAmount: true, status: true, createdAt: true,
      user: { select: { name: true, email: true } },
      plan: { select: { name: true } },
      coupon: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Coupon</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-200">{o.user.name || '—'}</p>
                    <p className="text-xs text-gray-500">{o.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{o.plan.name}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-200">{formatCurrency(o.amount)}</span>
                    {o.discountAmount > 0 && <span className="ml-1 text-xs text-green-400">(-{formatCurrency(o.discountAmount)})</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.coupon?.code ?? '—'}</td>
                  <td className="px-5 py-3"><Badge variant={statusBadge[o.status]}>{o.status}</Badge></td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
