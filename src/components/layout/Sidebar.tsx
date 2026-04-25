'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Video, ClipboardList, ShoppingBag, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',         label: 'Overview',       icon: LayoutDashboard },
  { href: '/dashboard/library', label: 'My Library',     icon: BookOpen },
  { href: '/dashboard/pdfs',    label: 'PDF Notes',      icon: FileText },
  { href: '/dashboard/videos',  label: 'Video Lectures', icon: Video },
  { href: '/dashboard/tests',   label: 'Mock Tests',     icon: ClipboardList },
  { href: '/store',             label: 'Browse Store',   icon: ShoppingBag },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 min-h-screen hidden md:block">
      <nav className="p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
