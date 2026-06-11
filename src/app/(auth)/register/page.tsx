'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setUnverifiedEmail(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', form)
      sessionStorage.setItem('reg_pwd', form.password)
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.unverified) {
        setUnverifiedEmail(form.email)
      } else {
        toast.error(data?.error || 'Registration failed')
      }
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
            <Image src="/logo.png" alt="Almoners Adda" width={64} height={64} className="rounded-2xl shadow-lg shadow-primary-900/50" />
            <div>
              <p className="text-xl font-bold text-white">Almoners Adda</p>
              <p className="text-sm text-gray-500">Health Beyond Medicine</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start learning today</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          {unverifiedEmail && (
            <div className="mb-5 bg-yellow-950/60 border border-yellow-800 rounded-xl px-4 py-3.5 text-sm">
              <p className="text-yellow-300 font-semibold mb-1">Email already registered</p>
              <p className="text-yellow-500 text-xs mb-3">This email exists but the account is not yet verified. Check your inbox for a verification code.</p>
              <button
                type="button"
                onClick={() => router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`)}
                className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 underline underline-offset-2 transition"
              >
                Go to verification page →
              </button>
            </div>
          )}
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
