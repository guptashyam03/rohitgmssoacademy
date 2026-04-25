import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { CsvQuestion } from '@/types'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const contentId = formData.get('contentId') as string

    if (!file || !contentId) return NextResponse.json({ error: 'Missing file or contentId' }, { status: 400 })

    const content = await prisma.content.findUnique({
      where: { id: contentId, type: 'MOCK_TEST' },
      include: { mockTest: true },
    })

    if (!content?.mockTest) return NextResponse.json({ error: 'Mock test not found' }, { status: 404 })

    const text = await file.text()
    const { data, errors } = Papa.parse<CsvQuestion>(text, { header: true, skipEmptyLines: true })

    if (errors.length > 0) return NextResponse.json({ error: 'CSV parsing error', details: errors }, { status: 400 })

    const questions = data.map((row, i) => {
      const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean)
      const validAnswers = ['A', 'B', 'C', 'D']
      if (!validAnswers.includes(row.correct_answer?.toUpperCase())) {
        throw new Error(`Row ${i + 2}: correct_answer must be A, B, C, or D`)
      }
      return {
        mockTestId:    content.mockTest!.id,
        question:      row.question,
        options,
        correctAnswer: row.correct_answer.toUpperCase(),
        explanation:   row.explanation || null,
        marks:         parseInt(String(row.marks)) || 1,
        order:         i,
        section:       row.section?.trim() || 'General',
      }
    })

    await prisma.question.deleteMany({ where: { mockTestId: content.mockTest.id } })
    await prisma.question.createMany({ data: questions })

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    await prisma.mockTest.update({
      where: { id: content.mockTest.id },
      data:  { totalMarks },
    })

    return NextResponse.json({ created: questions.length, totalMarks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
