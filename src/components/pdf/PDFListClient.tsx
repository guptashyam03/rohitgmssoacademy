'use client'

import Link from 'next/link'
import { FileText, Download } from 'lucide-react'

interface PDF {
  id: string
  title: string
  subject: string | null
  description: string | null
  driveFileId: string | null
}

export default function PDFListClient({ pdfs }: { pdfs: PDF[] }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pdfs.map(c => (
        <div key={c.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-700 transition p-5 flex items-start gap-3 group">
          <div className="w-10 h-10 bg-blue-900/50 border border-blue-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={18} className="text-blue-400" />
          </div>

          <Link href={`/dashboard/pdfs/${c.id}`} className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-200 line-clamp-2 group-hover:text-white transition">{c.title}</p>
            {c.subject && <p className="text-xs text-gray-500 mt-1">{c.subject}</p>}
            {c.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</p>}
          </Link>

          {c.driveFileId && (
            <a
              href={`https://drive.google.com/uc?export=download&id=${c.driveFileId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Download PDF"
              className="shrink-0 mt-0.5 p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-gray-800 transition"
              onClick={e => e.stopPropagation()}
            >
              <Download size={16} />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
