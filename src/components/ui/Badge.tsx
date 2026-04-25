import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    success: 'bg-green-900/60 text-green-400 border border-green-800',
    warning: 'bg-yellow-900/60 text-yellow-400 border border-yellow-800',
    danger:  'bg-red-900/60 text-red-400 border border-red-800',
    info:    'bg-blue-900/60 text-blue-400 border border-blue-800',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
