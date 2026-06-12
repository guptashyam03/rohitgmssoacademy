'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { Mail } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (!digits.length) return
    const next = [...otp]
    digits.forEach((d, i) => { next[i] = d })
    setOtp(next)
    const focusIdx = Math.min(digits.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', form)
      setStep('verify')
      toast.success('Verification code sent to your email!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      await axios.post('/api/auth/register', form)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      toast.success('New code sent!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-otp', { email: form.email, otp: code })
      const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (res?.error) {
        toast.success('Account verified! Please sign in.')
        router.push('/login')
      } else {
        toast.success('Welcome to Almoners Adda!')
        router.push('/dashboard')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Verification failed'
      toast.error(msg)
      if (err.response?.status === 410) {
        setStep('form')
        setOtp(['', '', '', '', '', ''])
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
          {step === 'form' ? (
            <>
              <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
              <p className="text-gray-500 text-sm mt-1">Start learning today</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mt-6">Verify your email</h1>
              <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code we sent to</p>
              <p className="text-primary-400 text-sm font-medium">{form.email}</p>
            </>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name',     label: 'Full Name',     type: 'text',     placeholder: 'John Doe' },
                { name: 'email',    label: 'Email Address', type: 'email',    placeholder: 'you@example.com' },
                { name: 'phone',    label: 'Mobile Number', type: 'tel',      placeholder: '10-digit mobile number' },
                { name: 'password', label: 'Password',      type: 'password', placeholder: 'Min 8 characters' },
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
              <Button type="submit" size="lg" className="w-full" loading={loading}>Send Verification Code</Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary-900/50 border border-primary-800 rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-primary-400" />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 text-center mb-4">Code expires in 15 minutes</p>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-bold bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent py-3"
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>Verify & Create Account</Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-primary-400 font-medium hover:text-primary-300 transition disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend code'}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']) }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition"
                >
                  Back to sign up form
                </button>
              </div>
            </form>
          )}

          {step === 'form' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-400 font-medium hover:text-primary-300 transition">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
