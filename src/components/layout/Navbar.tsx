'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { GraduationCap, LogOut, User, ShoppingBag, LayoutDashboard, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = (session?.user as any)?.role

  return (
    <nav className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="hidden sm:block">RohitGMSSO <span className="text-primary-400">Academy</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/store" className="text-sm text-gray-400 hover:text-white font-medium transition">Browse</Link>
            <Link href="/plans" className="text-sm text-gray-400 hover:text-white font-medium transition">Plans</Link>
          </div>

          <div className="flex items-center gap-3">
            {!session ? (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white font-medium transition">Login</Link>
                <Link href="/register" className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-500 font-medium transition">Sign Up</Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition"
                >
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="" width={32} height={32} className="rounded-full ring-2 ring-primary-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-900 border border-primary-700 flex items-center justify-center">
                      <User size={16} className="text-primary-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-200 hidden sm:block">{session.user?.name?.split(' ')[0]}</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">
                        <LayoutDashboard size={16} /> My Dashboard
                      </Link>
                      <Link href="/dashboard/library" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">
                        <GraduationCap size={16} /> My Library
                      </Link>
                      <Link href="/store" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">
                        <ShoppingBag size={16} /> Store
                      </Link>
                      {(role === 'ADMIN' || role === 'INSTRUCTOR') && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-800 mt-1 pt-1">
                        <button onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
