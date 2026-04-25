import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            RohitGMSSO <span className="text-primary-400 ml-1">Academy</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/store" className="hover:text-gray-300 transition">Browse</Link>
            <Link href="/plans" className="hover:text-gray-300 transition">Plans</Link>
            <Link href="/login" className="hover:text-gray-300 transition">Login</Link>
          </div>
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} RohitGMSSO Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
