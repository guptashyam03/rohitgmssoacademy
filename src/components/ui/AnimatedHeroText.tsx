'use client'

import { useEffect, useState } from 'react'

const line1 = ['Learn', 'Smarter.']
const line2 = ['Score', 'Higher.']
const total  = line1.length + line2.length

export default function AnimatedHeroText() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= total) return
    const t = setTimeout(() => setCount(c => c + 1), 160)
    return () => clearTimeout(t)
  }, [count])

  const show = (i: number) => count > i

  const wordStyle = (i: number): React.CSSProperties => ({
    display:        'inline-block',
    marginRight:    '0.28em',
    opacity:        show(i) ? 1 : 0,
    transform:      show(i) ? 'translateY(0)' : 'translateY(24px)',
    transition:     'opacity 0.45s ease, transform 0.45s ease',
  })

  return (
    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
      <span style={wordStyle(0)}>Learn</span>
      <span style={wordStyle(1)}>Smarter.</span>
      <br />
      <span
        className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400"
        style={wordStyle(2)}
      >Score</span>
      {' '}
      <span
        className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400"
        style={wordStyle(3)}
      >Higher.</span>
    </h1>
  )
}
