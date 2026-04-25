'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function CouponManager() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '', isPercent: true, maxUses: '', expiresAt: '' })

  function toggle(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/admin/coupons', {
        ...form,
        discount: parseFloat(form.discount),
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      })
      toast.success('Coupon created')
      router.refresh()
      setOpen(false)
      setForm({ code: '', discount: '', isPercent: true, maxUses: '', expiresAt: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus size={16} /> New Coupon</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Coupon Code" value={form.code} onChange={e => toggle('code', e.target.value.toUpperCase())} required placeholder="SAVE20" />
          <Input label="Discount Value" type="number" step="0.01" value={form.discount} onChange={e => toggle('discount', e.target.value)} required placeholder="20" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={form.isPercent} onChange={() => toggle('isPercent', true)} /> Percentage (%)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={!form.isPercent} onChange={() => toggle('isPercent', false)} /> Flat Amount (₹)
              </label>
            </div>
          </div>
          <Input label="Max Uses (leave blank for unlimited)" type="number" value={form.maxUses} onChange={e => toggle('maxUses', e.target.value)} />
          <Input label="Expiry Date (optional)" type="date" value={form.expiresAt} onChange={e => toggle('expiresAt', e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Create Coupon</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
