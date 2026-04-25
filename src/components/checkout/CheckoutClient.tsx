'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Tag, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  plan: { id: string; name: string; price: number }
}

declare global {
  interface Window { Razorpay: any }
}

export default function CheckoutClient({ plan }: Props) {
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [couponResult, setCouponResult] = useState<{
    valid: boolean
    discountAmount: number
    finalAmount: number
    discountLabel: string
  } | null>(null)

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const { data } = await axios.post('/api/payments/validate-coupon', {
        couponCode: couponCode.trim().toUpperCase(),
        planId: plan.id,
      })
      setCouponResult(data)
      toast.success(`Coupon applied — ${data.discountLabel}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() { setCouponCode(''); setCouponResult(null) }

  async function handlePayment() {
    setPayLoading(true)
    const appliedCoupon = couponResult ? couponCode.trim().toUpperCase() : undefined

    if (displayPrice === 0) {
      try {
        await axios.post('/api/payments/free-checkout', { planId: plan.id, couponCode: appliedCoupon })
        toast.success('Access granted! Redirecting...')
        router.push('/dashboard')
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to activate plan')
      } finally {
        setPayLoading(false)
      }
      return
    }

    try {
      const { data } = await axios.post('/api/payments/create-order', { planId: plan.id, couponCode: appliedCoupon })

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'RohitGMSSO Academy',
          description: data.planName,
          order_id: data.orderId,
          handler: async (response: any) => {
            try {
              await axios.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              toast.success('Payment successful! Redirecting...')
              router.push('/dashboard')
            } catch {
              toast.error('Payment verification failed. Contact support.')
            }
          },
          theme: { color: '#2563eb' },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
        setPayLoading(false)
      }

      script.onerror = () => { toast.error('Failed to load payment gateway'); setPayLoading(false) }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment')
      setPayLoading(false)
    }
  }

  const displayPrice = couponResult ? couponResult.finalAmount : plan.price

  return (
    <Card>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <div>
          <p className="font-semibold text-white text-lg">{plan.name}</p>
          <p className="text-xs text-gray-500">One-time payment · Lifetime access</p>
        </div>
        <div className="text-right">
          {couponResult ? (
            <>
              <p className="text-sm text-gray-500 line-through">{formatCurrency(plan.price)}</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(couponResult.finalAmount)}</p>
              <p className="text-xs text-green-500">You save {formatCurrency(couponResult.discountAmount)}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-primary-400">{formatCurrency(plan.price)}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Code</label>
        {couponResult ? (
          <div className="flex items-center gap-2 p-3 bg-green-950/50 border border-green-900 rounded-lg">
            <CheckCircle size={16} className="text-green-400 shrink-0" />
            <span className="text-sm text-green-300 font-medium flex-1">{couponCode.toUpperCase()} — {couponResult.discountLabel}</span>
            <button onClick={removeCoupon} className="text-green-500 hover:text-green-300 transition">
              <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
            />
            <Button variant="outline" size="sm" type="button" onClick={handleApplyCoupon} loading={couponLoading}>
              <Tag size={14} /> Apply
            </Button>
          </div>
        )}
      </div>

      <Button size="lg" className="w-full" onClick={handlePayment} loading={payLoading}>
        Pay {formatCurrency(displayPrice)}
      </Button>

      <p className="text-center text-xs text-gray-600 mt-4">Secured by Razorpay · 256-bit SSL encryption</p>
    </Card>
  )
}
