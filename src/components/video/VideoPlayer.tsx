'use client'

import { useRef, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'

export default function VideoPlayer({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=0`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Blocks YouTube share button (bottom-left) */}
      <div className="absolute bottom-0 left-0 bg-white z-10" style={{ width: '180px', height: '50px' }} />

      {/* Our own fullscreen button (bottom-right) */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-2 right-3 z-20 text-white hover:text-gray-300 transition"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  )
}
