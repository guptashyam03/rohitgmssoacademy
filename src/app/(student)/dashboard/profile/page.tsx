import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const userId  = (session!.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true, password: true, image: true },
  })

  if (!user) return null

  return (
    <ProfileClient
      user={{
        name:      user.name,
        email:     user.email,
        role:      user.role,
        joinedAt:  user.createdAt.toISOString(),
        hasPassword: !!user.password,
        image:     user.image,
      }}
    />
  )
}
