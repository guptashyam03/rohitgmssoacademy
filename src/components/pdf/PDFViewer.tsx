'use client'

export default function PDFViewer({ fileId }: { fileId: string }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden relative"
      style={{ height: '80vh' }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Blocks the Drive toolbar (download + share buttons) */}
      <div className="absolute top-0 left-0 right-0 bg-white z-10" style={{ height: '40px' }} />

      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        className="w-full h-full"
        allow="autoplay"
        style={{ marginTop: '-1px' }}
      />
    </div>
  )
}
