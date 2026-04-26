import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()

    const plan = await prisma.plan.create({
      data: {
        name:        body.name,
        type:        body.type,
        price:       body.price,
        description: body.description || null,
      },
    })

    // If bundlePlanIds provided, copy all content from those plans into this new plan
    if (Array.isArray(body.bundlePlanIds) && body.bundlePlanIds.length > 0) {
      const sourcePlanContents = await prisma.planContent.findMany({
        where: { planId: { in: body.bundlePlanIds } },
        select: { contentId: true },
      })
      const uniqueContentIds = Array.from(new Set(sourcePlanContents.map(pc => pc.contentId)))
      if (uniqueContentIds.length > 0) {
        await prisma.planContent.createMany({
          data: uniqueContentIds.map(contentId => ({ planId: plan.id, contentId })),
          skipDuplicates: true,
        })
      }
    }

    return NextResponse.json(plan, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
