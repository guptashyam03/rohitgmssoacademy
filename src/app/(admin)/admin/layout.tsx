import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'INSTRUCTOR')) redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-400 font-medium">Admin Panel</span>
          <Link href="/dashboard" className="text-sm text-primary-400 hover:text-primary-300 transition">← Student View</Link>
        </header>
        <main className="flex-1 p-6 bg-gray-950">{children}</main>
      </div>
    </div>
  )
}
