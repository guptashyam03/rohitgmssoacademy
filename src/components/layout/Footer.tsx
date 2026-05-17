import { Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          <div>
            <p className="text-sm font-semibold text-white mb-2">General Queries</p>
            <p className="text-sm text-gray-500 max-w-xs mb-3">
              Have a question about courses, plans, or anything else?
            </p>
            <div className="flex flex-col gap-2">
              <a href="https://t.me/rohitguptamsso" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition">
                <Send size={13} /> Join Telegram Group
              </a>
              <a href="https://t.me/rohitgpsw" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition">
                <Send size={13} /> Personal Chat
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-white">RohitGMSSO Academy</p>
            <p className="text-xs text-gray-600 mt-1">Premium Learning Platform</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-white mb-2">Technical Support</p>
            <p className="text-sm text-gray-500 max-w-xs md:ml-auto mb-3">
              Facing issues with the platform? We&apos;ll help you resolve it quickly.
            </p>
            <a href="https://t.me/guptashyam03" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition md:justify-end">
              <Send size={13} /> Telegram Support
            </a>
          </div>

        </div>
        <p className="text-center text-xs text-gray-700 mt-8">&copy; {new Date().getFullYear()} RohitGMSSO Academy. All rights reserved.</p>
      </div>
    </footer>
  )
}
