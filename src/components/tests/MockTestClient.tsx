'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { MockTestWithQuestions, TestResult } from '@/types'

interface Props {
  mockTest: MockTestWithQuestions
  contentTitle: string
}

type Phase = 'instructions' | 'test' | 'result'
type QStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked'

export default function MockTestClient({ mockTest, contentTitle }: Props) {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(mockTest.duration * 60)
  const [result, setResult] = useState<TestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const answersRef = useRef(answers)
  const timeLeftRef = useRef(timeLeft)
  const submittingRef = useRef(false)

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])

  const currentQ = mockTest.questions[currentIdx]

  useEffect(() => {
    if (phase === 'test' && currentQ) {
      setVisited(prev => new Set(prev).add(currentQ.id))
    }
  }, [currentIdx, phase, currentQ])

  function getStatus(qId: string): QStatus {
    const hasAnswer = !!answers[qId]
    const isMarked = !!marked[qId]
    const isVisited = visited.has(qId)
    if (hasAnswer && isMarked) return 'answered_marked'
    if (hasAnswer) return 'answered'
    if (isMarked) return 'marked'
    if (isVisited) return 'not_answered'
    return 'not_visited'
  }

  function statusStyle(status: QStatus, isCurrent: boolean): string {
    const ring = isCurrent ? ' ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''
    switch (status) {
      case 'answered':         return 'bg-green-600 text-white hover:bg-green-500' + ring
      case 'answered_marked':  return 'bg-purple-600 text-white hover:bg-purple-500' + ring
      case 'marked':           return 'bg-purple-400 text-white hover:bg-purple-300' + ring
      case 'not_answered':     return 'bg-orange-500 text-white hover:bg-orange-400' + ring
      case 'not_visited':      return 'bg-gray-700 text-gray-300 hover:bg-gray-600' + ring
    }
  }

  const submitTest = useCallback(async (forcedAnswers?: Record<string, string>) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    const finalAnswers = forcedAnswers ?? answersRef.current
    const timeTaken = mockTest.duration * 60 - timeLeftRef.current
    try {
      const res = await axios.post('/api/tests/submit', { mockTestId: mockTest.id, answers: finalAnswers, timeTaken })
      setResult(res.data)
      setPhase('result')
    } catch {
      toast.error('Failed to submit. Please try again.')
      submittingRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [mockTest.id, mockTest.duration])

  useEffect(() => {
    if (phase !== 'test') return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          toast('Time is up! Submitting your test...', { icon: '⏰' })
          submitTest()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, submitTest])

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function saveAndNext() {
    if (currentIdx < mockTest.questions.length - 1) setCurrentIdx(i => i + 1)
  }

  function markAndNext() {
    if (currentQ) setMarked(prev => ({ ...prev, [currentQ.id]: true }))
    if (currentIdx < mockTest.questions.length - 1) setCurrentIdx(i => i + 1)
  }

  function clearResponse() {
    if (!currentQ) return
    setAnswers(prev => { const n = { ...prev }; delete n[currentQ.id]; return n })
    setMarked(prev => { const n = { ...prev }; delete n[currentQ.id]; return n })
  }

  // ─── Instructions ───────────────────────────────────────────────────────────
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="bg-primary-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">{contentTitle ?? mockTest.title ?? 'Mock Test'}</h1>
            <p className="text-primary-200 text-sm mt-1">Read all instructions carefully before starting</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Duration', value: `${mockTest.duration} minutes` },
                { label: 'Questions', value: mockTest.questions.length },
                { label: 'Total Marks', value: mockTest.totalMarks },
                { label: 'Pass Mark', value: mockTest.passMark },
                ...(mockTest.negativeMarks > 0 ? [{ label: 'Negative Marking', value: `-${mockTest.negativeMarks} per wrong` }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-white font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Question Status Legend</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { color: 'bg-green-600', label: 'Answered' },
                  { color: 'bg-orange-500', label: 'Not Answered' },
                  { color: 'bg-gray-600', label: 'Not Visited' },
                  { color: 'bg-purple-500', label: 'Marked for Review' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded ${color} shrink-0`} />
                    <span className="text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {mockTest.instructions && (
              <div className="bg-blue-950 border border-blue-900 rounded-xl p-4 mb-6 text-sm text-blue-300 whitespace-pre-line">{mockTest.instructions}</div>
            )}

            <button
              onClick={() => setPhase('test')}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition text-lg"
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const pct = Math.round((result.score / result.totalMarks) * 100)
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Score card */}
          <div className={`rounded-2xl p-8 text-center border ${result.passed ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-900'}`}>
            {result.passed
              ? <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
              : <XCircle size={56} className="text-red-400 mx-auto mb-4" />}
            <h2 className={`text-5xl font-extrabold mb-2 ${result.passed ? 'text-green-300' : 'text-red-300'}`}>{pct}%</h2>
            <p className={`text-xl font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.passed ? 'Passed!' : 'Failed'}</p>
            <p className="text-gray-500 text-sm mt-3">
              Score: {result.score}/{result.totalMarks} &nbsp;·&nbsp; Time: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Correct', value: result.questions.filter(q => q.isCorrect).length, color: 'text-green-400' },
              { label: 'Incorrect', value: result.questions.filter(q => q.selectedAnswer && !q.isCorrect).length, color: 'text-red-400' },
              { label: 'Skipped', value: result.questions.filter(q => !q.selectedAnswer).length, color: 'text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Section-wise breakdown */}
          {(() => {
            const resultSections = Array.from(new Set(result.questions.map(q => (q as any).section ?? 'General')))
            if (resultSections.length <= 1) return null
            return (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Section-wise Score</h3>
                <div className="space-y-2">
                  {resultSections.map(sec => {
                    const qs = result.questions.filter(q => ((q as any).section ?? 'General') === sec)
                    const correct = qs.filter(q => q.isCorrect).length
                    const pct = Math.round((correct / qs.length) * 100)
                    return (
                      <div key={sec} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-32 truncate">{sec}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-300 w-16 text-right">{correct}/{qs.length} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Answer review */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Answer Review</h3>
            {result.questions.map((q, i) => (
              <div key={q.id} className={`bg-gray-900 rounded-xl border p-5 ${q.isCorrect ? 'border-green-900' : 'border-red-900'}`}>
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${q.isCorrect ? 'bg-green-700' : 'bg-red-700'}`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-100 mb-3">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx)
                        const isCorrect = letter === q.correctAnswer
                        const isSelected = letter === q.selectedAnswer
                        return (
                          <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isCorrect ? 'bg-green-900/60 text-green-300 border border-green-800' : isSelected && !isCorrect ? 'bg-red-900/60 text-red-300 border border-red-800' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                            <span className="font-semibold w-5">{letter}.</span> {opt}
                            {isCorrect && <CheckCircle size={14} className="ml-auto text-green-400" />}
                            {isSelected && !isCorrect && <XCircle size={14} className="ml-auto text-red-400" />}
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 bg-blue-950 border border-blue-900 rounded-lg p-3 text-sm text-blue-300">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Test Phase ──────────────────────────────────────────────────────────────
  if (!currentQ) return null
  const urgentTime = timeLeft < 300
  const answeredCount = Object.keys(answers).length
  const markedCount = Object.keys(marked).length
  const notVisitedCount = mockTest.questions.filter(q => !visited.has(q.id)).length
  const notAnsweredCount = mockTest.questions.filter(q => visited.has(q.id) && !answers[q.id]).length

  // Build ordered unique sections
  const sections = Array.from(new Map(mockTest.questions.map(q => [q.section, q.section])).keys())

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-400 hidden sm:block">
          Marks for correct answer{' '}
          <span className="text-green-400 font-bold">{currentQ.marks ?? 1}.0</span>
          {' | '}Negative Marks{' '}
          <span className="text-red-400 font-bold">{mockTest.negativeMarks}.0</span>
        </div>
        <div className="text-sm font-semibold text-gray-300 sm:hidden">{mockTest.questions.length} Questions</div>
        <div className={`flex items-center gap-2 font-mono font-bold text-base ${urgentTime ? 'text-red-400' : 'text-white'}`}>
          {urgentTime && <AlertTriangle size={16} className="text-red-400 animate-pulse" />}
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Main question area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question header */}
          <div className="bg-gray-900/70 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Q <span className="text-white font-bold">{currentIdx + 1}</span>
                <span className="text-gray-600"> / {mockTest.questions.length}</span>
              </span>
              {sections.length > 1 && (
                <span className="text-xs bg-primary-900/60 text-primary-300 border border-primary-800 px-2 py-0.5 rounded-full font-medium">
                  {currentQ.section}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600">{currentQ.marks ?? 1} mark{(currentQ.marks ?? 1) !== 1 ? 's' : ''}</span>
          </div>

          {/* Question content - scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-white text-base md:text-lg leading-relaxed mb-7">{currentQ.question}</p>
            <div className="space-y-3 max-w-2xl">
              {currentQ.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx)
                const selected = answers[currentQ.id] === letter
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: letter }))}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition border-2 ${
                      selected
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/40'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${selected ? 'bg-white text-primary-600' : 'bg-gray-800 text-gray-400'}`}>
                      {letter}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={markAndNext}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm px-3 py-2 rounded-lg font-medium transition"
              >
                <Flag size={14} /> Mark for Review & Next
              </button>
              <button
                onClick={clearResponse}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs sm:text-sm px-3 py-2 rounded-lg font-medium transition"
              >
                Clear Response
              </button>
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(i => i - 1)}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-3 py-2 rounded-lg font-medium transition"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={saveAndNext}
                disabled={currentIdx === mockTest.questions.length - 1}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg font-medium transition"
              >
                Save & Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 hidden md:flex overflow-hidden">
          {/* Status legend */}
          <div className="p-3 border-b border-gray-800 shrink-0">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { color: 'bg-green-600', count: answeredCount, label: 'Answered' },
                { color: 'bg-orange-500', count: notAnsweredCount, label: 'Not Answered' },
                { color: 'bg-gray-600', count: notVisitedCount, label: 'Not Visited' },
                { color: 'bg-purple-500', count: markedCount, label: 'Marked' },
              ].map(({ color, count, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2 py-1.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 ${color}`}>{count}</span>
                  <span className="text-gray-400 text-xs leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question grid - scrollable, grouped by section */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {sections.map(section => {
              const sectionQs = mockTest.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.section === section)
              return (
                <div key={section}>
                  {sections.length > 1 && (
                    <div className="bg-primary-900/50 border border-primary-800 text-primary-300 text-xs font-semibold px-2 py-1 rounded-lg mb-2">
                      {section}
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-1.5">
                    {sectionQs.map(({ q, i }) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition ${statusStyle(getStatus(q.id), i === currentIdx)}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit */}
          <div className="p-3 border-t border-gray-800 shrink-0">
            <button
              onClick={() => submitTest()}
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
            <p className="text-center text-xs text-gray-600 mt-1.5">{answeredCount}/{mockTest.questions.length} answered</p>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-between shrink-0">
        <span className="text-xs text-gray-400">{answeredCount}/{mockTest.questions.length} answered</span>
        <button
          onClick={() => submitTest()}
          disabled={submitting}
          className="bg-primary-600 hover:bg-primary-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
