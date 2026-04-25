import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import CouponManager from '@/components/admin/CouponManager'

export const revalidate = 30

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <CouponManager />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Used / Max</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {coupons.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No coupons yet.</td></tr>
              )}
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 font-mono font-bold text-white">{c.code}</td>
                  <td className="px-5 py-3 text-gray-300">{c.isPercent ? `${c.discount}%` : `₹${c.discount}`}</td>
                  <td className="px-5 py-3 text-gray-400">{c.usedCount} / {c.maxUses ?? '∞'}</td>
                  <td className="px-5 py-3 text-gray-500">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                  <td className="px-5 py-3"><Badge variant={c.isActive ? 'success' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
