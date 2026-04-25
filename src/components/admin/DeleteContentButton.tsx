'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function DeleteContentButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this content? This cannot be undone.')) return
    setLoading(true)
    try {
      await axios.delete(`/api/admin/content/${id}`)
      toast.success('Content deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  return <Button size="sm" variant="danger" onClick={handleDelete} loading={loading}>Delete</Button>
}
