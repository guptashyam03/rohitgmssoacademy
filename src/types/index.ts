import { Role, PlanType, ContentType, OrderStatus } from '@prisma/client'

export type { Role, PlanType, ContentType, OrderStatus }

export interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: Role
}

export interface ContentWithPlan {
  id: string
  title: string
  description?: string | null
  type: ContentType
  subject?: string | null
  tags: string[]
  thumbnail?: string | null
  driveShareUrl?: string | null
  youtubeId?: string | null
  duration?: string | null
  isFeatured: boolean
  plans: { plan: { id: string; name: string; type: PlanType; price: number } }[]
}

export interface MockTestWithQuestions {
  id: string
  title?: string
  duration: number
  totalMarks: number
  passMark: number
  negativeMarks: number
  instructions?: string | null
  questions: Question[]
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string | null
  marks: number
  order: number
  section: string
}

export interface TestResult {
  score: number
  totalMarks: number
  passed: boolean
  percentage: number
  timeTaken: number
  answers: Record<string, string>
  questions: (Question & { selectedAnswer?: string; isCorrect: boolean })[]
}

export interface CsvQuestion {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
  marks?: number
  section?: string
}
