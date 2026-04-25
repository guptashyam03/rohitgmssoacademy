import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  mockTestId: z.string(),
  answers:    z.record(z.string()),
  timeTaken:  z.number(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { mockTestId, answers, timeTaken } = schema.parse(await req.json())
    const userId = (session.user as any).id

    const mockTest = await prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: { questions: true },
    })

    if (!mockTest) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    let score = 0
    const reviewQuestions = mockTest.questions.map(q => {
      const selected = answers[q.id]
      const isCorrect = selected === q.correctAnswer
      if (isCorrect) score += q.marks
      else if (selected && mockTest.negativeMarks > 0) score -= mockTest.negativeMarks
      return {
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        order: q.order,
        section: q.section,
        selectedAnswer: selected,
        isCorrect,
      }
    })

    score = Math.max(0, score)
    const passed = score >= mockTest.passMark

    await prisma.testAttempt.create({
      data: {
        userId,
        mockTestId,
        answers,
        score,
        totalMarks: mockTest.totalMarks,
        passed,
        timeTaken,
      },
    })

    return NextResponse.json({
      score,
      totalMarks: mockTest.totalMarks,
      passed,
      percentage: Math.round((score / mockTest.totalMarks) * 100),
      timeTaken,
      answers,
      questions: reviewQuestions,
    })
  } catch {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
