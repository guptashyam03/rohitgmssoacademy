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
import { formatCurrency } from '@/lib/utils'

const planTypes = ['PDF_ONLY', 'MOCK_TEST_ONLY', 'PREMIUM', 'CUSTOM']

type Plan = {
  id: string
  name: string
  type: string
  price: number
  description: string | null
  isActive: boolean
  _count: { orders: number; accessGrants: number }
}

const emptyForm = { name: '', type: 'PREMIUM', price: '', description: '', isActive: true }

export default function PlanManager({ plans }: { plans: Plan[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(plan: Plan) {
    setEditId(plan.id)
    setForm({ name: plan.name, type: plan.type, price: String(plan.price), description: plan.description ?? '', isActive: plan.isActive })
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (editId) {
        await axios.put(`/api/admin/plans/${editId}`, payload)
        toast.success('Plan updated')
      } else {
        await axios.post('/api/admin/plans', payload)
        toast.success('Plan created')
      }
      router.refresh()
      setOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save plan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this plan? This cannot be undone.')) return
    setDeleting(id)
    try {
      await axios.delete(`/api/admin/plans/${id}`)
      toast.success('Plan deleted')
      router.refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete plan')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} plan{plans.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> New Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-gray-900 border border-gray-800 rounded-xl text-gray-500">
            No plans yet. Click "New Plan" to create one.
          </div>
        )}
        {plans.map(p => (
          <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{p.name}</h3>
                <p className="text-2xl font-bold text-primary-400 mt-1">{formatCurrency(p.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-900/40 transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition disabled:opacity-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
            {p.description && <p className="text-sm text-gray-400 mb-3">{p.description}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{p._count.orders} orders</span>
              <span>{p._count.accessGrants} active grants</span>
              <Badge variant="default">{p.type.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Plan' : 'Create Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Plan Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Plan Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
              {planTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="isFree" checked={form.price === '0'}
                onChange={e => setForm(p => ({ ...p, price: e.target.checked ? '0' : '' }))}
                className="rounded accent-primary-600" />
              <label htmlFor="isFree" className="text-sm text-gray-300">Free Plan (students can enrol without payment)</label>
            </div>
            <Input label="Price (INR)" type="number" step="1" value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              disabled={form.price === '0'} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              rows={2}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          {editId && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="rounded accent-primary-600" />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active (visible to students)</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>{editId ? 'Save Changes' : 'Create Plan'}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
