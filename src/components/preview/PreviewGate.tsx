'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'

type ContentType = 'video' | 'pdf' | 'test'

const KEYS: Record<ContentType, string> = {
  video: 'lms_prev_vid',
  pdf:   'lms_prev_pdf',
  test:  'lms_prev_tst',
}

const LABELS: Record<ContentType, string> = {
  video: 'video lecture',
  pdf:   'PDF note',
  test:  'mock test',
}

interface Props {
  contentId: string
  contentType: ContentType
  children: React.ReactNode
}

export default function PreviewGate({ contentId, contentType, children }: Props) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'allowed' | 'blocked'>('loading')

  useEffect(() => {
    const key = KEYS[contentType]
    const stored = localStorage.getItem(key)

    if (!stored) {
      localStorage.setItem(key, contentId)
      setState('allowed')
    } else if (stored === contentId) {
      setState('allowed')
    } else {
      setState('blocked')
    }
  }, [contentId, contentType])

  if (state === 'loading') return null

  if (state === 'blocked') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-900 border border-gray-800 rounded-xl text-center px-6">
        <div className="w-14 h-14 bg-primary-900/50 border border-primary-800 rounded-full flex items-center justify-center mb-4">
          <Lock size={24} className="text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Free preview used</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-sm">
          You&apos;ve already used your free {LABELS[contentType]} preview. Purchase a plan to unlock all content.
        </p>
        <Link
          href="/plans"
          className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl transition"
        >
          View Plans
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between bg-yellow-950/40 border border-yellow-900/50 rounded-xl px-4 py-3">
        <p className="text-sm text-yellow-300">
          <span className="font-semibold">Free preview</span> — you get 1 free {LABELS[contentType]}. Purchase a plan for full access.
        </p>
        <Link href="/plans" className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition whitespace-nowrap ml-4">
          Get full access →
        </Link>
      </div>
      {children}
    </div>
  )
}
