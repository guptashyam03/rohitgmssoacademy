'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'
import { GraduationCap, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import axios from 'axios'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      await axios.post('/api/auth/resend-otp', { email })
      toast.success('New code sent! Check your inbox.')
    } catch {
      toast.error('Could not resend code. Try again.')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-email', { email, otp })
      toast.success('Email verified! Signing you in...')
      const password = sessionStorage.getItem('reg_pwd') ?? ''
      sessionStorage.removeItem('reg_pwd')
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        toast('Please log in with your credentials.')
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired code')
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
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/50 mx-auto mb-4">
            <GraduationCap size={34} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify your email</h1>
          <p className="text-gray-500 text-sm mt-2">
            We sent a 6-digit code to{' '}
            <span className="text-gray-300 font-medium">{email || 'your email'}</span>
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <div className="flex items-center gap-3 bg-primary-950/50 border border-primary-900 rounded-xl p-4 mb-6">
            <Mail size={20} className="text-primary-400 shrink-0" />
            <p className="text-sm text-primary-300">Check your inbox and enter the code below. It expires in 10 minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-center text-2xl font-bold tracking-widest placeholder-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>Verify &amp; Continue</Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
            <p>
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary-400 font-medium hover:text-primary-300 transition disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
            <p>
              Wrong email?{' '}
              <Link href="/register" className="text-primary-400 font-medium hover:text-primary-300 transition">Go back</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}
