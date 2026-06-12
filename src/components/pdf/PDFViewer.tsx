'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function PDFViewer({ fileId }: { fileId: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  return (
    <div
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden relative"
      style={{ height: '80vh' }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Blocks the Drive toolbar (download + share buttons) */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 z-10" style={{ height: '44px' }} />

      {/* Loading spinner */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-800">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-primary-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-800">
          <p className="text-gray-500 text-sm">Could not load PDF. Please try again later.</p>
        </div>
      )}

      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        className="w-full h-full"
        allow="autoplay"
        style={{ marginTop: '-1px' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
