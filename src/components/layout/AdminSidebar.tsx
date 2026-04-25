'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Tag, ShoppingCart, BookOpen, ClipboardList, Video, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',               label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/content',       label: 'Content',     icon: BookOpen },
  { href: '/admin/content/pdfs',  label: 'PDFs',        icon: FileText },
  { href: '/admin/content/videos',label: 'Videos',      icon: Video },
  { href: '/admin/content/tests', label: 'Mock Tests',  icon: ClipboardList },
  { href: '/admin/plans',         label: 'Plans',       icon: Tag },
  { href: '/admin/users',         label: 'Users',       icon: Users },
  { href: '/admin/coupons',       label: 'Coupons',     icon: Tag },
  { href: '/admin/orders',        label: 'Orders',      icon: ShoppingCart },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gray-950 border-r border-gray-800 min-h-screen hidden md:flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap size={15} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-tight">RohitGMSSO</p>
          <p className="text-xs text-primary-400 leading-tight">Academy Admin</p>
        </div>
      </div>
      <nav className="p-3 space-y-0.5 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
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
