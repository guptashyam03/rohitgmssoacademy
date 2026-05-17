'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Download, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'

interface PDF {
  id: string
  title: string
  subject: string | null
  description: string | null
  driveFileId: string | null
}

export default function PDFListClient({ pdfs }: { pdfs: PDF[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)

  const downloadable = pdfs.filter(p => p.driveFileId)
  const allSelected  = downloadable.length > 0 && downloadable.every(p => selected.has(p.id))

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(downloadable.map(p => p.id)))
    }
  }

  async function downloadSelected() {
    const toDownload = pdfs.filter(p => p.driveFileId && selected.has(p.id))
    if (toDownload.length === 0) { toast.error('Select at least one PDF'); return }
    setDownloading(true)
    toast.success(`Starting download of ${toDownload.length} PDF${toDownload.length > 1 ? 's' : ''}...`)
    for (let i = 0; i < toDownload.length; i++) {
      const url = `https://drive.google.com/uc?export=download&id=${toDownload[i].driveFileId}`
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, i * 800)
    }
    setTimeout(() => setDownloading(false), toDownload.length * 800 + 500)
  }

  if (pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center bg-gray-900 rounded-xl border border-gray-800">
        <FileText size={40} className="text-gray-700 mb-3" />
        <p className="text-gray-500 text-sm mb-3">No PDF notes available in your plans.</p>
        <Link href="/plans" className="text-primary-400 text-sm font-medium hover:text-primary-300">Browse Plans →</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {downloadable.length > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            {allSelected
              ? <CheckSquare size={16} className="text-primary-400" />
              : <Square size={16} />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-gray-700">|</span>
              <span className="text-xs text-gray-500">{selected.size} selected</span>
              <button
                onClick={downloadSelected}
                disabled={downloading}
                className="ml-auto flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
              >
                <Download size={14} />
                {downloading ? 'Downloading…' : `Download (${selected.size})`}
              </button>
            </>
          )}
        </div>
      )}

      {/* PDF grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfs.map(c => {
          const isSelected = selected.has(c.id)
          return (
            <div
              key={c.id}
              className={`bg-gray-900 rounded-xl border transition flex items-start gap-3 p-5 group relative ${
                isSelected ? 'border-primary-600 ring-1 ring-primary-600' : 'border-gray-800'
              }`}
            >
              {/* Checkbox */}
              {c.driveFileId && (
                <button
                  onClick={() => toggleOne(c.id)}
                  className="shrink-0 mt-0.5"
                  aria-label="Select PDF"
                >
                  {isSelected
                    ? <CheckSquare size={18} className="text-primary-400" />
                    : <Square size={18} className="text-gray-600 group-hover:text-gray-400 transition" />}
                </button>
              )}

              {/* Icon */}
              <div className="w-10 h-10 bg-blue-900/50 border border-blue-800 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-400" />
              </div>

              {/* Info + open link */}
              <Link href={`/dashboard/pdfs/${c.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 line-clamp-2 hover:text-white transition">{c.title}</p>
                {c.subject && <p className="text-xs text-gray-500 mt-1">{c.subject}</p>}
                {c.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</p>}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
