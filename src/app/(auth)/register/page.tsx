'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { GraduationCap } from 'lucide-react'
import Button from '@/components/ui/Button'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', form)
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/50">
              <GraduationCap size={34} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">RohitGMSSO Academy</p>
              <p className="text-sm text-gray-500">Premium Learning Platform</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start learning today</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                <input
                  name={name} type={type} placeholder={placeholder} required
                  value={(form as any)[name]} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            ))}
            <Button type="submit" size="lg" className="w-full" loading={loading}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 font-medium hover:text-primary-300 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
