'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import UserAccessManager from './UserAccessManager'
import UserActions from './UserActions'

interface Grant {
  id: string
  planId: string
  planName: string
  expiresAt: string | null
}

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  orderCount: number
  grants: Grant[]
}

interface Props {
  users: User[]
  plans: { id: string; name: string }[]
}

export default function UserSearchTable({ users, plans }: Props) {
  const [query, setQuery] = useState('')

  const filtered = users.filter(u => {
    const q = query.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-10 py-2.5 border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600">
        {query ? `${filtered.length} of ${users.length} users` : `${users.length} total users`}
      </p>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Active Plans</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-600">
                    {query ? `No users found for "${query}"` : 'No users yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-200">{user.name || '—'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'INSTRUCTOR' ? 'warning' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.grants.map(g => <Badge key={g.id} variant="success">{g.planName}</Badge>)}
                        {user.grants.length === 0 && <span className="text-gray-600 text-xs">None</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{user.orderCount}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UserAccessManager
                          user={{ id: user.id, name: user.name, email: user.email, grants: user.grants }}
                          plans={plans}
                        />
                        <UserActions user={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
