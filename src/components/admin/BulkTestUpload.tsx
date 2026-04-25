'use client'

import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Upload, Download } from 'lucide-react'

export default function BulkTestUpload({ contentId }: { contentId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contentId', contentId)
      const { data } = await axios.post('/api/admin/tests/upload', formData)
      toast.success(`Uploaded ${data.created} questions successfully`)
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
      'Speed of light?,3x10^6,3x10^7,3x10^8,3x10^9,C,Speed of light is 3x10^8 m/s,2,Physics',
      'Formula of water?,H2,O2,H2O,CO2,C,Water molecule has 2 hydrogen and 1 oxygen,1,Chemistry',
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <h3 className="font-semibold text-white mb-4">Bulk Upload Questions (CSV)</h3>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-400">Required columns: <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-gray-300">question, option_a, option_b, option_c, option_d, correct_answer (A/B/C/D), explanation, marks, section</code></p>
        <p className="text-xs text-gray-500">The <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">section</code> column groups questions — e.g. Physics, Chemistry, Mathematics. Leave blank to use "General".</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadTemplate} type="button">
            <Download size={16} /> Download Template
          </Button>
          <Button onClick={() => fileRef.current?.click()} loading={loading} type="button">
            <Upload size={16} /> Upload CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
        </div>
      </div>
    </Card>
  )
}
