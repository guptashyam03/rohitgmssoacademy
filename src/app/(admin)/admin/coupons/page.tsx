import { prisma } from '@/lib/prisma'
import CouponManager from '@/components/admin/CouponManager'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  const serialized = coupons.map(c => ({
    id:        c.id,
    code:      c.code,
    discount:  c.discount,
    isPercent: c.isPercent,
    maxUses:   c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive:  c.isActive,
  }))

  return (
    <div className="max-w-4xl">
      <CouponManager coupons={serialized} />
    </div>
  )
}
