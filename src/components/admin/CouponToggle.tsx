'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      await axios.patch(`/api/admin/coupons/${id}`, { isActive: !isActive })
      toast.success(isActive ? 'Coupon deactivated' : 'Coupon activated')
      router.refresh()
    } catch {
      toast.error('Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
        isActive
          ? 'bg-red-950 text-red-400 hover:bg-red-900 border border-red-900'
          : 'bg-green-950 text-green-400 hover:bg-green-900 border border-green-900'
      }`}
    >
      {loading ? '...' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
