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
          <div className="flex items-center gap-3">
            <Link href="/store" className="text-base font-semibold px-5 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-gray-800 transition border border-gray-700">Browse</Link>
            <Link href="/plans" className="text-base font-semibold px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition shadow-lg shadow-primary-900/40">Plans</Link>
            <Link href="/login" className="text-base font-semibold px-5 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition">Login</Link>
          </div>
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} RohitGMSSO Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
