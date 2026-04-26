'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Shield, Trash2, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

interface Props {
  user: { id: string; name: string | null; email: string | null; role: string }
}

const ROLES: Role[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

const roleColors: Record<Role, string> = {
  STUDENT:    'bg-gray-700 text-gray-200',
  INSTRUCTOR: 'bg-yellow-900/60 text-yellow-300',
  ADMIN:      'bg-red-900/60 text-red-300',
}

export default function UserActions({ user }: Props) {
  const router = useRouter()
  const [roleOpen, setRoleOpen]       = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(user.role as Role)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  async function saveRole() {
    if (selectedRole === user.role) { setRoleOpen(false); return }
    setSaving(true)
    try {
      await axios.patch(`/api/admin/users/${user.id}`, { role: selectedRole })
      toast.success(`Role updated to ${selectedRole}`)
      router.refresh()
      setRoleOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser() {
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/users/${user.id}`)
      toast.success('User deleted')
      router.refresh()
      setDeleteOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRoleOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-700 transition"
        >
          <Shield size={12} className="text-primary-400" />
          Role
          <ChevronDown size={11} className="text-gray-500" />
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-1 text-xs font-medium bg-red-900/30 border border-red-900/50 text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-900/60 transition"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      {/* Role change modal */}
      <Modal open={roleOpen} onClose={() => setRoleOpen(false)} title={`Change role — ${user.name || user.email}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Select a new role for this user.</p>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition ${
                  selectedRole === r
                    ? 'border-primary-500 bg-primary-600 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {selectedRole !== user.role && (
            <div className={`rounded-lg px-4 py-3 text-sm ${roleColors[selectedRole]}`}>
              {selectedRole === 'ADMIN' && (
                <p><span className="font-semibold">Warning:</span> This user will have full admin access to the platform.</p>
              )}
              {selectedRole === 'INSTRUCTOR' && (
                <p>This user will be able to create and manage content.</p>
              )}
              {selectedRole === 'STUDENT' && (
                <p>This user will only have student access.</p>
              )}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setRoleOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} disabled={selectedRole === user.role} onClick={saveRole}>
              Save Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete user account">
        <div className="space-y-4">
          <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4">
            <p className="text-sm text-red-300 font-semibold mb-1">This action cannot be undone.</p>
            <p className="text-sm text-red-400/80">
              Deleting <span className="font-medium text-red-300">{user.name || user.email}</span> will permanently remove their account, orders, and access grants.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={deleteUser}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
