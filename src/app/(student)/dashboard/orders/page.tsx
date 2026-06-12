import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusIcon = {
  PAID:    <CheckCircle size={15} className="text-green-400" />,
  PENDING: <Clock size={15} className="text-yellow-400" />,
  FAILED:  <XCircle size={15} className="text-red-400" />,
  REFUNDED:<XCircle size={15} className="text-gray-400" />,
}

const statusColor: Record<string, string> = {
  PAID:     'text-green-400 bg-green-900/30',
  PENDING:  'text-yellow-400 bg-yellow-900/30',
  FAILED:   'text-red-400 bg-red-900/30',
  REFUNDED: 'text-gray-400 bg-gray-800',
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session!.user as any).id

  let orders: any[] = []
  try {
    orders = await prisma.order.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch { /* show empty state */ }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Purchase History</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <ShoppingBag size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/plans" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition text-sm">
            Browse Plans
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-800/40 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-200">{order.plan?.name ?? 'â€”'}</p>
                    <p className="text-xs text-gray-600 mt-0.5 font-mono">{order.razorpayOrderId ?? order.id.slice(0, 16)}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-300 font-medium">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusIcon[order.status as keyof typeof statusIcon]}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
