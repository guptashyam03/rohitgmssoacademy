'use client'

import { useRef, useState } from 'react'
import { Maximize, Minimize, Loader2 } from 'lucide-react'

export default function VideoPlayer({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loaded, setLoaded] = useState(false)

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
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <Loader2 size={32} className="text-primary-400 animate-spin" />
        </div>
      )}

      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />

      {/* Custom fullscreen button overlay */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  )
}
