'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import BulkTestUpload from './BulkTestUpload'

interface Plan { id: string; name: string }

interface Props {
  type: 'PDF' | 'VIDEO' | 'MOCK_TEST'
  plans: Plan[]
  initialData?: any
}

export default function ContentForm({ type, plans, initialData }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    subject: initialData?.subject ?? '',
    tags: initialData?.tags?.join(', ') ?? '',
    isFeatured: initialData?.isFeatured ?? false,
    isActive: initialData?.isActive ?? true,
    planIds: initialData?.plans?.map((p: any) => p.planId) ?? [],
    // PDF
    driveFileId: initialData?.driveFileId ?? '',
    driveShareUrl: initialData?.driveShareUrl ?? '',
    // Video
    youtubeId: initialData?.youtubeId ?? '',
    duration: initialData?.duration ?? '',
    // Mock test
    testDuration:     initialData?.mockTest?.duration ?? 30,
    totalMarks:       initialData?.mockTest?.totalMarks ?? 100,
    passMark:         initialData?.mockTest?.passMark ?? 40,
    negativeMarks:    initialData?.mockTest?.negativeMarks ?? 0,
    instructions:     initialData?.mockTest?.instructions ?? '',
  })
  const [loading, setLoading] = useState(false)

  function toggle(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function togglePlan(id: string) {
    setForm(prev => ({
      ...prev,
      planIds: prev.planIds.includes(id) ? prev.planIds.filter((p: string) => p !== id) : [...prev.planIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        type,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      }
      if (initialData?.id) {
        await axios.put(`/api/admin/content/${initialData.id}`, payload)
        toast.success('Content updated')
      } else {
        await axios.post('/api/admin/content', payload)
        toast.success('Content created')
      }
      router.push('/admin/content')
      router.refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
        <h2 className="font-semibold text-white">Basic Info</h2>
        <Input label="Title" value={form.title} onChange={e => toggle('title', e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" rows={3} value={form.description} onChange={e => toggle('description', e.target.value)} />
        </div>
        <Input label="Subject" value={form.subject} onChange={e => toggle('subject', e.target.value)} placeholder="e.g. Mathematics" />
        <Input label="Tags (comma-separated)" value={form.tags} onChange={e => toggle('tags', e.target.value)} placeholder="e.g. algebra, calculus" />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => toggle('isActive', e.target.checked)} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => toggle('isFeatured', e.target.checked)} /> Featured</label>
        </div>
      </div>

      {type === 'PDF' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">Google Drive</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Google Drive Share URL</label>
            <input
              type="text"
              className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={form.driveShareUrl}
              placeholder="https://drive.google.com/file/d/.../view"
              onChange={e => {
                const url = e.target.value
                const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
                toggle('driveShareUrl', url)
                if (match) toggle('driveFileId', match[1])
              }}
            />
            {form.driveFileId && (
              <p className="text-xs text-green-600 mt-1">✓ File ID extracted: {form.driveFileId}</p>
            )}
          </div>
        </div>
      )}

      {type === 'VIDEO' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">YouTube</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">YouTube URL or Video ID</label>
            <input
              type="text"
              className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={form.youtubeId}
              placeholder="https://youtu.be/abc123 or https://youtube.com/watch?v=abc123"
              onChange={e => {
                const val = e.target.value
                const match = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
                toggle('youtubeId', match ? match[1] : val)
              }}
            />
            {form.youtubeId && (
              <p className="text-xs text-green-600 mt-1">✓ Video ID: {form.youtubeId}</p>
            )}
          </div>
          <Input label="Duration (display)" value={form.duration} onChange={e => toggle('duration', e.target.value)} placeholder="45 min" />
        </div>
      )}

      {type === 'MOCK_TEST' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-white">Mock Test Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (minutes)" type="number" value={form.testDuration} onChange={e => toggle('testDuration', +e.target.value)} />
            <Input label="Pass Mark" type="number" value={form.passMark} onChange={e => toggle('passMark', +e.target.value)} />
            <Input label="Total Marks" type="number" value={form.totalMarks} onChange={e => toggle('totalMarks', +e.target.value)} />
            <Input label="Negative Marks per Wrong" type="number" step="0.25" value={form.negativeMarks} onChange={e => toggle('negativeMarks', +e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Instructions</label>
            <textarea className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" rows={3} value={form.instructions} onChange={e => toggle('instructions', e.target.value)} />
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="font-semibold text-white mb-3">Assign to Plans</h2>
        <div className="flex flex-wrap gap-3">
          {plans.map(p => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.planIds.includes(p.id)} onChange={() => togglePlan(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">{initialData ? 'Update' : 'Create'} Content</Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
      </div>

      {type === 'MOCK_TEST' && initialData?.id && (
        <BulkTestUpload contentId={initialData.id} />
      )}
    </form>
  )
}
