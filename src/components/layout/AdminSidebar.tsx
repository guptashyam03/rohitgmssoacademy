'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Tag, Ticket, ShoppingCart, BookOpen, ClipboardList, Video, GraduationCap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin',                label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/content',        label: 'Content',    icon: BookOpen,        exact: true },
  { href: '/admin/content/pdfs',   label: 'PDFs',       icon: FileText,        exact: false },
  { href: '/admin/content/videos', label: 'Videos',     icon: Video,           exact: false },
  { href: '/admin/content/tests',  label: 'Mock Tests', icon: ClipboardList,   exact: false },
  { href: '/admin/plans',          label: 'Plans',      icon: Tag,             exact: false },
  { href: '/admin/users',          label: 'Users',      icon: Users,           exact: false },
  { href: '/admin/coupons',        label: 'Coupons',    icon: Ticket,          exact: false },
  { href: '/admin/orders',         label: 'Orders',     icon: ShoppingCart,    exact: false },
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
          <p className="text-xs font-bold text-white leading-tight">Almoners Adda</p>
          <p className="text-xs text-primary-400 leading-tight">Admin Panel</p>
        </div>
      </div>
      <nav className="p-3 space-y-0.5 flex-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
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
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300 transition-all"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
