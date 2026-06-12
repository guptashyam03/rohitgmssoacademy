'use client'

import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Upload, Download, AlertTriangle } from 'lucide-react'

interface UploadSectionProps {
  language: 'ENGLISH' | 'HINDI'
  label: string
  contentId: string
  onSuccess: () => void
}

function UploadSection({ language, label, contentId, onSuccess }: UploadSectionProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState<{ count: number } | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = window.confirm(
      `This will DELETE all existing ${label} questions and replace them with the uploaded file.\n\nAre you sure?`
    )
    if (!confirmed) {
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contentId', contentId)
      formData.append('language', language)
      const { data } = await axios.post('/api/admin/tests/upload', formData)
      setUploaded({ count: data.created })
      toast.success(`${data.created} ${label} questions uploaded`)
      onSuccess()
      router.refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function downloadTemplate() {
    const csv = [
      'question,option_a,option_b,option_c,option_d,correct_answer,explanation,marks,section',
      'What is 2+2?,3,4,5,6,B,Basic arithmetic: 2+2=4,1,Mathematics',
      'Capital of India?,Mumbai,Delhi,Chennai,Kolkata,B,New Delhi is the capital of India,1,General Knowledge',
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `questions_template_${language.toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const accent = language === 'ENGLISH' ? 'blue' : 'orange'
  const badgeClass = language === 'ENGLISH'
    ? 'bg-blue-900/50 text-blue-300 border-blue-800'
    : 'bg-orange-900/50 text-orange-300 border-orange-800'

  return (
    <div className="border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>{label}</span>
          {uploaded && (
            <span className="text-xs text-gray-400">{uploaded.count} questions uploaded</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={downloadTemplate} type="button" size="sm">
          <Download size={14} /> Template
        </Button>
        <Button onClick={() => fileRef.current?.click()} loading={loading} type="button" size="sm">
          <Upload size={14} /> Upload CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  )
}

export default function BulkTestUpload({ contentId }: { contentId: string }) {
  const [key, setKey] = useState(0)

  return (
    <Card>
      <h3 className="font-semibold text-white mb-2">Bulk Upload Questions (CSV)</h3>
      <p className="text-xs text-gray-500 mb-4">
        Upload separate CSVs for each language. Students will choose their preferred language before starting the test.
        Columns: <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">question, option_a, option_b, option_c, option_d, correct_answer (A/B/C/D), explanation, marks, section</code>
      </p>

      <div className="flex items-start gap-2 bg-yellow-950/50 border border-yellow-800 rounded-lg px-3 py-2.5 mb-4">
        <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300">Uploading a CSV for a language will <strong>delete all existing questions</strong> for that language and replace them.</p>
      </div>

      <div className="space-y-3">
        <UploadSection language="ENGLISH" label="English" contentId={contentId} onSuccess={() => setKey(k => k + 1)} />
        <UploadSection language="HINDI"   label="Hindi"   contentId={contentId} onSuccess={() => setKey(k => k + 1)} />
      </div>
    </Card>
  )
}
