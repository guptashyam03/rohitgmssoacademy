import { prisma } from '@/lib/prisma'
import UserSearchTable from '@/components/admin/UserSearchTable'

export const revalidate = 30

export default async function AdminUsersPage() {
  const [users, plans] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        accessGrants: {
          where: { isActive: true },
          select: { id: true, planId: true, expiresAt: true, plan: { select: { name: true } } },
        },
        _count: { select: { orders: true } },
      },
    }),
    prisma.plan.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ])

  const serialized = users.map(u => ({
    id:         u.id,
    name:       u.name,
    email:      u.email,
    role:       u.role,
    createdAt:  u.createdAt.toISOString(),
    orderCount: u._count.orders,
    grants:     u.accessGrants.map(g => ({
      id:        g.id,
      planId:    g.planId,
      planName:  g.plan.name,
      expiresAt: g.expiresAt ? g.expiresAt.toISOString() : null,
    })),
  }))

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <UserSearchTable users={serialized} plans={plans} />
    </div>
  )
}
