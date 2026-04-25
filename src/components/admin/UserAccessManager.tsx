'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

interface Grant {
  id: string
  planId: string
  planName: string
  expiresAt: string | null
}

interface Props {
  user: { id: string; name: string | null; email: string | null; grants: Grant[] }
  plans: { id: string; name: string }[]
}

const PRESET_DAYS = [7, 15, 30, 60, 90, 180, 365]

export default function UserAccessManager({ user, plans }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [accessType, setAccessType] = useState<'lifetime' | 'fixed'>('lifetime')
  const [days, setDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() { setSelectedPlan(''); setAccessType('lifetime'); setDays(30); setCustomDays('') }

  async function grantAccess() {
    if (!selectedPlan) return
    setLoading(true)
    try {
      const expiresInDays = accessType === 'fixed' ? (customDays ? parseInt(customDays) : days) : null
      await axios.post('/api/admin/access', { userId: user.id, planId: selectedPlan, action: 'grant', expiresInDays })
      toast.success(accessType === 'lifetime' ? 'Lifetime access granted' : `Access granted for ${expiresInDays} days`)
      router.refresh()
      setOpen(false)
      reset()
    } catch {
      toast.error('Failed to grant access')
    } finally {
      setLoading(false)
    }
  }

  async function revokeAccess(grantId: string) {
    setLoading(true)
    try {
      await axios.post('/api/admin/access', { grantId, action: 'revoke' })
      toast.success('Access revoked')
      router.refresh()
    } catch {
      toast.error('Failed to revoke access')
    } finally {
      setLoading(false)
    }
  }

  function formatExpiry(expiresAt: string | null) {
    if (!expiresAt) return 'Lifetime'
    const date = new Date(expiresAt)
    const now = new Date()
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    if (diff < 0) return `Expired on ${label}`
    return `Expires ${label} (${diff}d left)`
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Manage</Button>

      <Modal open={open} onClose={() => { setOpen(false); reset() }} title={`Access: ${user.name || user.email}`}>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Current Access</p>
            {user.grants.length === 0 ? (
              <p className="text-sm text-gray-500">No active plans.</p>
            ) : (
              <div className="space-y-2">
                {user.grants.map(g => (
                  <div key={g.id} className="flex items-center justify-between bg-green-950/50 border border-green-900 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-green-300">{g.planName}</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        {g.expiresAt ? <Clock size={11} /> : <span className="font-bold">∞</span>}
                        {formatExpiry(g.expiresAt)}
                      </p>
                    </div>
                    <Button size="sm" variant="danger" onClick={() => revokeAccess(g.id)} loading={loading}>Revoke</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">Grant New Access</p>

            <select
              value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
              className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">Select plan...</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <div className="flex rounded-lg border border-gray-700 overflow-hidden">
              <button type="button" onClick={() => setAccessType('lifetime')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition ${accessType === 'lifetime' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                <span className="text-base font-bold">∞</span> Lifetime
              </button>
              <button type="button" onClick={() => setAccessType('fixed')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition ${accessType === 'fixed' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                <Clock size={15} /> Fixed Days
              </button>
            </div>

            {accessType === 'fixed' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {PRESET_DAYS.map(d => (
                    <button key={d} type="button" onClick={() => { setDays(d); setCustomDays('') }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${days === d && !customDays ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-primary-500'}`}>
                      {d} days
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={customDays} onChange={e => setCustomDays(e.target.value)}
                    placeholder="Custom days..."
                    className="flex-1 border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-500 shrink-0">days</span>
                </div>
                <p className="text-xs text-gray-500">
                  Access expires on: <span className="font-medium text-gray-300">
                    {new Date(Date.now() + (customDays ? parseInt(customDays) : days) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </p>
              </div>
            )}

            <Button onClick={grantAccess} loading={loading} disabled={!selectedPlan} className="w-full">
              Grant Access
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
