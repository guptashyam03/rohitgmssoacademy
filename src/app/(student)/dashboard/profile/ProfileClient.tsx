'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Props {
  user: {
    name: string | null
    email: string | null
    role: string
    joinedAt: string
    hasPassword: boolean
    image: string | null
  }
}

export default function ProfileClient({ user }: Props) {
  const router = useRouter()

  const [name, setName]               = useState(user.name ?? '')
  const [savingName, setSavingName]   = useState(false)

  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [savingPwd, setSavingPwd]     = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSavingName(true)
    try {
      await axios.patch('/api/user/profile', { name: name.trim() })
      toast.success('Name updated')
      router.refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd.length < 8) { toast.error('New password must be at least 8 characters'); return }
    setSavingPwd(true)
    try {
      await axios.patch('/api/user/profile', { currentPassword: currentPwd, newPassword: newPwd })
      toast.success('Password updated')
      setCurrentPwd(''); setNewPwd('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Account info card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Info</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-800">
            <Mail size={16} className="text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-200">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-800">
            <Shield size={16} className="text-gray-500 shrink-0" />
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-gray-500">Role</p>
              </div>
              <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'INSTRUCTOR' ? 'warning' : 'default'}>
                {user.role}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5">
            <User size={16} className="text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Member since</p>
              <p className="text-sm text-gray-200">{formatDate(user.joinedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Update name */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Display Name</h2>
        <form onSubmit={saveName} className="flex gap-3">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder="Your full name"
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button type="submit" loading={savingName} disabled={name.trim() === (user.name ?? '')}>
            Save
          </Button>
        </form>
      </div>

      {/* Change password — only for credential accounts */}
      {user.hasPassword && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Change Password</h2>
          <form onSubmit={savePassword} className="space-y-3">
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required
                placeholder="Current password"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8}
                placeholder="New password (min 8 characters)"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" loading={savingPwd} disabled={!currentPwd || !newPwd}>
              Update Password
            </Button>
          </form>
        </div>
      )}

      {!user.hasPassword && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm text-gray-500">You signed in with Google. Password change is not available for Google accounts.</p>
        </div>
      )}
    </div>
  )
}
