'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Info } from 'lucide-react'
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
  const [phase, setPhase]           = useState<Phase>('instructions')
  const [answers, setAnswers]       = useState<Record<string, string>>({})
  const [marked, setMarked]         = useState<Record<string, boolean>>({})
  const [visited, setVisited]       = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft]     = useState(mockTest.duration * 60)
  const [result, setResult]         = useState<TestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const answersRef    = useRef(answers)
  const timeLeftRef   = useRef(timeLeft)
  const submittingRef = useRef(false)
  const containerRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { answersRef.current  = answers  }, [answers])
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])

  function enterFullscreen() {
    const el = containerRef.current as any
    if (!el) return
    try {
      if (el.requestFullscreen)            el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen)    el.mozRequestFullScreen()
    } catch { /* ignore */ }
  }

  function exitFullscreen() {
    const doc = document as any
    try {
      if (doc.exitFullscreen)       doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen()
      else if (doc.mozCancelFullScreen)  doc.mozCancelFullScreen()
    } catch { /* ignore */ }
  }

  // Re-enter fullscreen if user presses Escape during the test
  useEffect(() => {
    if (phase !== 'test') return
    function onFsChange() {
      const doc = document as any
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement)
      if (!isFs) {
        toast('You exited fullscreen. Re-entering...', { icon: '⚠️', duration: 2500 })
        setTimeout(enterFullscreen, 300)
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
    }
  }, [phase])

  // Exit fullscreen when test ends
  useEffect(() => {
    if (phase === 'result') exitFullscreen()
  }, [phase])

  const currentQ = mockTest.questions[currentIdx]

  // Build ordered unique sections
  const sections = Array.from(new Map(mockTest.questions.map(q => [q.section ?? 'General', q.section ?? 'General'])).keys())

  useEffect(() => {
    if (sections.length > 0 && activeSection === null) setActiveSection(sections[0])
  }, [sections, activeSection])

  useEffect(() => {
    if (phase === 'test' && currentQ) {
      setVisited(prev => new Set(prev).add(currentQ.id))
      setActiveSection(currentQ.section ?? 'General')
    }
  }, [currentIdx, phase, currentQ])

  function getStatus(qId: string): QStatus {
    const hasAnswer = !!answers[qId]
    const isMarked  = !!marked[qId]
    const isVisited = visited.has(qId)
    if (hasAnswer && isMarked) return 'answered_marked'
    if (hasAnswer)             return 'answered'
    if (isMarked)              return 'marked'
    if (isVisited)             return 'not_answered'
    return 'not_visited'
  }

  function paletteClass(status: QStatus, isCurrent: boolean): string {
    const base = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition select-none '
    const ring = isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-950 ' : ''
    switch (status) {
      case 'answered':        return base + ring + 'bg-green-600 text-white hover:bg-green-500'
      case 'answered_marked': return base + ring + 'bg-blue-500 text-white hover:bg-blue-400'
      case 'marked':          return base + ring + 'bg-blue-700 text-white hover:bg-blue-600'
      case 'not_answered':    return base + ring + 'bg-red-600 text-white hover:bg-red-500'
      case 'not_visited':     return base + ring + 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }
  }

  const submitTest = useCallback(async (forcedAnswers?: Record<string, string>) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    const finalAnswers = forcedAnswers ?? answersRef.current
    const timeTaken    = mockTest.duration * 60 - timeLeftRef.current
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

  function goToSection(sec: string) {
    setActiveSection(sec)
    const idx = mockTest.questions.findIndex(q => (q.section ?? 'General') === sec)
    if (idx !== -1) setCurrentIdx(idx)
  }

  // ─── Instructions ────────────────────────────────────────────────────────────
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="bg-primary-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">{contentTitle}</h1>
            <p className="text-primary-200 text-sm mt-1">Read all instructions carefully before starting</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Duration',    value: `${mockTest.duration} minutes` },
                { label: 'Questions',   value: mockTest.questions.length },
                { label: 'Total Marks', value: mockTest.totalMarks },
                { label: 'Pass Mark',   value: mockTest.passMark },
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
                  { color: 'bg-green-600',  label: 'Answered' },
                  { color: 'bg-red-600',    label: 'Not Answered (Visited)' },
                  { color: 'bg-gray-600',   label: 'Not Visited' },
                  { color: 'bg-blue-600',   label: 'Marked for Review' },
                  { color: 'bg-blue-500',   label: 'Answered & Marked' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded ${color} shrink-0`} />
                    <span className="text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {mockTest.instructions && (
              <div className="bg-blue-950 border border-blue-900 rounded-xl p-4 mb-6 text-sm text-blue-300 whitespace-pre-line">
                {mockTest.instructions}
              </div>
            )}

            <button
              onClick={() => { enterFullscreen(); setPhase('test') }}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition text-lg"
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Result ──────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const pct = Math.round((result.score / result.totalMarks) * 100)
    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className={`rounded-2xl p-8 text-center border ${result.passed ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-900'}`}>
            {result.passed
              ? <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
              : <XCircle    size={56} className="text-red-400 mx-auto mb-4" />}
            <h2 className={`text-5xl font-extrabold mb-2 ${result.passed ? 'text-green-300' : 'text-red-300'}`}>{pct}%</h2>
            <p className={`text-xl font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.passed ? 'Passed!' : 'Failed'}</p>
            <p className="text-gray-500 text-sm mt-3">
              Score: {result.score}/{result.totalMarks} &nbsp;·&nbsp; Time: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Correct',   value: result.questions.filter(q => q.isCorrect).length,                            color: 'text-green-400' },
              { label: 'Incorrect', value: result.questions.filter(q => q.selectedAnswer && !q.isCorrect).length,       color: 'text-red-400' },
              { label: 'Skipped',   value: result.questions.filter(q => !q.selectedAnswer).length,                      color: 'text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {(() => {
            const resultSections = Array.from(new Set(result.questions.map(q => (q as any).section ?? 'General')))
            if (resultSections.length <= 1) return null
            return (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Section-wise Score</h3>
                <div className="space-y-2">
                  {resultSections.map(sec => {
                    const qs      = result.questions.filter(q => ((q as any).section ?? 'General') === sec)
                    const correct = qs.filter(q => q.isCorrect).length
                    const sp      = Math.round((correct / qs.length) * 100)
                    return (
                      <div key={sec} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-32 truncate">{sec}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${sp >= 60 ? 'bg-green-500' : sp >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${sp}%` }} />
                        </div>
                        <span className="text-xs text-gray-300 w-16 text-right">{correct}/{qs.length} ({sp}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

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
                        const letter     = String.fromCharCode(65 + idx)
                        const isCorrect  = letter === q.correctAnswer
                        const isSelected = letter === q.selectedAnswer
                        return (
                          <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${isCorrect ? 'bg-green-900/60 text-green-300 border-green-800' : isSelected && !isCorrect ? 'bg-red-900/60 text-red-300 border-red-800' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
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

  const urgentTime        = timeLeft < 300
  const answeredCount     = Object.keys(answers).length
  const markedCount       = Object.keys(marked).length
  const answeredMarked    = mockTest.questions.filter(q => answers[q.id] && marked[q.id]).length
  const notVisitedCount   = mockTest.questions.filter(q => !visited.has(q.id)).length
  const notAnsweredCount  = mockTest.questions.filter(q => visited.has(q.id) && !answers[q.id]).length

  const currentSection    = currentQ.section ?? 'General'
  const sectionIdx        = sections.indexOf(activeSection ?? currentSection)
  const sectionQuestions  = mockTest.questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.section ?? 'General') === (activeSection ?? currentSection))

  return (
    <div ref={containerRef} className="h-screen bg-gray-950 flex flex-col overflow-hidden select-none">

      {/* ── Row 1: Header ── */}
      <div className="bg-gray-900 border-b border-gray-700 px-5 py-2.5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-white font-bold text-base leading-tight">{contentTitle}</h1>
          <p className="text-gray-500 text-xs mt-0.5">{mockTest.questions.length} Questions · {mockTest.duration} Minutes</p>
        </div>
        <button
          onClick={() => { exitFullscreen(); setPhase('instructions') }}
          className="flex items-center gap-1.5 text-xs text-primary-400 border border-primary-700 hover:bg-primary-900/40 px-3 py-1.5 rounded-lg transition"
        >
          <Info size={13} /> Instructions
        </button>
      </div>

      {/* ── Row 2: Section tabs ── */}
      {sections.length > 1 && (
        <div className="bg-gray-900 border-b border-gray-700 flex items-center shrink-0 overflow-x-auto">
          <button
            onClick={() => { if (sectionIdx > 0) goToSection(sections[sectionIdx - 1]) }}
            className="px-2 py-3 text-gray-500 hover:text-white transition shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          {sections.map(sec => {
            const isActive  = sec === (activeSection ?? currentSection)
            return (
              <button
                key={sec}
                onClick={() => goToSection(sec)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition shrink-0 ${
                  isActive
                    ? 'border-primary-400 text-white bg-gray-800/60'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                {sec}
                <Info size={12} className="text-gray-500" />
              </button>
            )
          })}
          <button
            onClick={() => { if (sectionIdx < sections.length - 1) goToSection(sections[sectionIdx + 1]) }}
            className="px-2 py-3 text-gray-500 hover:text-white transition shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Row 3: Current section + timer ── */}
      <div className="bg-gray-950 border-b border-gray-800 px-5 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => { if (sectionIdx > 0) goToSection(sections[sectionIdx - 1]) }}
            className="text-gray-600 hover:text-gray-300 transition"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="font-medium text-gray-300">{activeSection ?? currentSection}</span>
          <Info size={13} className="text-gray-600" />
          <button
            onClick={() => { if (sectionIdx < sections.length - 1) goToSection(sections[sectionIdx + 1]) }}
            className="text-gray-600 hover:text-gray-300 transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-sm ${urgentTime ? 'text-red-400' : 'text-green-400'}`}>
          {urgentTime && <AlertTriangle size={14} className="animate-pulse" />}
          <Clock size={14} />
          <span>Time Left : {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* ── Main split layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Question area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Marks bar */}
          <div className="bg-gray-900/60 border-b border-gray-800 px-6 py-2 flex items-center gap-4 shrink-0">
            <span className="text-xs text-gray-400">
              Marks for correct answer:{' '}
              <span className="text-green-400 font-semibold">{currentQ.marks ?? 1}</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-xs text-gray-400">
              Negative Marks:{' '}
              <span className="text-red-400 font-semibold">{mockTest.negativeMarks}</span>
            </span>
          </div>

          {/* Question content — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Question No. {currentIdx + 1}
            </p>
            <p className="text-gray-100 text-base leading-relaxed mb-8">
              {currentQ.question}
            </p>

            {/* Radio-style options */}
            <div className="space-y-3 max-w-2xl">
              {currentQ.options.map((opt, idx) => {
                const letter   = String.fromCharCode(65 + idx)
                const selected = answers[currentQ.id] === letter
                return (
                  <label
                    key={idx}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: letter }))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${
                      selected
                        ? 'border-primary-500 bg-primary-900/30 text-white'
                        : 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Custom radio circle */}
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      selected ? 'border-primary-400 bg-primary-400' : 'border-gray-500'
                    }`}>
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="bg-gray-900 border-t border-gray-800 px-5 py-3 flex items-center justify-between shrink-0 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={markAndNext}
                className="text-sm text-purple-300 border border-purple-800 hover:bg-purple-900/40 px-4 py-2 rounded-lg font-medium transition"
              >
                Mark for Review &amp; Next
              </button>
              <button
                onClick={clearResponse}
                className="text-sm text-gray-400 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Clear Response
              </button>
            </div>
            <button
              onClick={saveAndNext}
              disabled={currentIdx === mockTest.questions.length - 1}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
            >
              Save &amp; Next <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 hidden md:flex overflow-hidden">

          {/* Status legend */}
          <div className="p-4 border-b border-gray-800 shrink-0 space-y-2">
            {[
              { color: 'bg-green-600',  count: answeredCount,    label: 'Answered' },
              { color: 'bg-red-600',    count: notAnsweredCount, label: 'Not Answered' },
              { color: 'bg-gray-600',   count: notVisitedCount,  label: 'Not Visited' },
              { color: 'bg-blue-700',   count: markedCount,      label: 'Marked for Review' },
              { color: 'bg-blue-500',   count: answeredMarked,   label: 'Answered & Marked' },
            ].map(({ color, count, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`${color} text-white text-xs font-bold w-7 h-7 rounded-md flex items-center justify-center shrink-0`}>
                  {count}
                </span>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Section label + palette */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-gray-300 mb-0.5 truncate">
              {activeSection ?? currentSection}
            </p>
            <p className="text-xs text-gray-600 mb-3">Choose a Question</p>
            <div className="grid grid-cols-4 gap-2">
              {sectionQuestions.map(({ q, i }) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={paletteClass(getStatus(q.id), i === currentIdx)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="p-4 border-t border-gray-800 shrink-0">
            <button
              onClick={() => submitTest()}
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <p className="text-center text-xs text-gray-600 mt-1.5">
              {answeredCount}/{mockTest.questions.length} answered
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: bottom bar */}
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
