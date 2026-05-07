'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export interface CouponRow {
  id: string
  code: string
  discount: number
  isPercent: boolean
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

const emptyForm = { code: '', discount: '', isPercent: true, maxUses: '', expiresAt: '' }

export default function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)

  function f(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(c: CouponRow) {
    setEditId(c.id)
    setForm({
      code:      c.code,
      discount:  String(c.discount),
      isPercent: c.isPercent,
      maxUses:   c.maxUses !== null ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    })
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        discount:  parseFloat(form.discount),
        isPercent: form.isPercent,
        maxUses:   form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }
      if (editId) {
        await axios.patch(`/api/admin/coupons/${editId}`, payload)
        toast.success('Coupon updated')
      } else {
        await axios.post('/api/admin/coupons', { ...payload, code: form.code })
        toast.success('Coupon created')
      }
      router.refresh()
      setOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(c: CouponRow) {
    try {
      await axios.patch(`/api/admin/coupons/${c.id}`, { isActive: !c.isActive })
      toast.success(c.isActive ? 'Coupon deactivated' : 'Coupon activated')
      router.refresh()
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  async function deleteCoupon(c: CouponRow) {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/admin/coupons/${c.id}`)
      toast.success('Coupon deleted')
      router.refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete coupon')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Coupons</h1>
        <Button onClick={openCreate}><Plus size={16} /> New Coupon</Button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Used / Max</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">No coupons yet.</td></tr>
              )}
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-3 font-mono font-bold text-white">{c.code}</td>
                  <td className="px-5 py-3 text-gray-300">{c.isPercent ? `${c.discount}%` : `₹${c.discount}`}</td>
                  <td className="px-5 py-3 text-gray-400">{c.usedCount} / {c.maxUses ?? '∞'}</td>
                  <td className="px-5 py-3 text-gray-500">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                  <td className="px-5 py-3"><Badge variant={c.isActive ? 'success' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition border ${
                          c.isActive
                            ? 'bg-red-950 text-red-400 hover:bg-red-900 border-red-900'
                            : 'bg-green-950 text-green-400 hover:bg-green-900 border-green-900'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-900/40 transition"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteCoupon(c)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Code</label>
            <input
              value={form.code}
              onChange={e => f('code', e.target.value.toUpperCase())}
              required={!editId}
              disabled={!!editId}
              placeholder="SAVE20"
              className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {editId && <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>}
          </div>

          <Input label="Discount Value" type="number" step="0.01" value={form.discount} onChange={e => f('discount', e.target.value)} required placeholder="20" />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Discount Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="radio" checked={form.isPercent} onChange={() => f('isPercent', true)} /> Percentage (%)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="radio" checked={!form.isPercent} onChange={() => f('isPercent', false)} /> Flat Amount (₹)
              </label>
            </div>
          </div>

          <Input label="Max Uses (leave blank for unlimited)" type="number" value={form.maxUses} onChange={e => f('maxUses', e.target.value)} />
          <Input label="Expiry Date (optional)" type="date" value={form.expiresAt} onChange={e => f('expiresAt', e.target.value)} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>{editId ? 'Save Changes' : 'Create Coupon'}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
