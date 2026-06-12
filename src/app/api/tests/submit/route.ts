import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  mockTestId: z.string(),
  answers:    z.record(z.string()),
  timeTaken:  z.number(),
  language:   z.enum(['ENGLISH', 'HINDI']).optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { mockTestId, answers, timeTaken, language } = schema.parse(await req.json())
    const userId = (session.user as any).id

    const mockTest = await prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: { questions: true },
    })

    if (!mockTest) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    const role = (session.user as any).role
    const isAdmin = role === 'ADMIN'

    const grant = isAdmin ? true : await prisma.accessGrant.findFirst({
      where: {
        userId,
        isActive: true,
        plan: { contents: { some: { content: { mockTest: { id: mockTestId } } } } },
      },
    })
    const isPreview = !grant

    // Score only the questions in the selected language
    const scoringQuestions = language
      ? mockTest.questions.filter(q => q.language === language)
      : mockTest.questions

    const totalMarks = scoringQuestions.reduce((sum, q) => sum + q.marks, 0)

    let score = 0
    const reviewQuestions = scoringQuestions.map(q => {
      const selected  = answers[q.id]
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
        language: q.language,
        selectedAnswer: selected,
        isCorrect,
      }
    })

    score = Math.max(0, score)
    const passed = score >= mockTest.passMark

    if (!isPreview) {
      await prisma.testAttempt.create({
        data: {
          userId,
          mockTestId,
          answers,
          score,
          totalMarks,
          passed,
          timeTaken,
        },
      })
    }

    return NextResponse.json({
      score,
      totalMarks,
      passed,
      percentage: Math.round((score / totalMarks) * 100),
      timeTaken,
      answers,
      questions: reviewQuestions,
      isPreview,
    })
  } catch {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
