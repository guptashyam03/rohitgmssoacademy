export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          <div>
            <p className="text-sm font-semibold text-white mb-1">General Queries</p>
            <p className="text-sm text-gray-500 max-w-xs">
              Have a question about courses, plans, or anything else?
              Connect with us on our social handles — links coming soon.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {/* Social media links will be added here */}
            <p className="text-xs text-gray-600 italic">Social media links coming soon</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-white mb-1">Technical Support</p>
            <p className="text-sm text-gray-500 max-w-xs md:ml-auto">
              Facing issues with the platform? Reach out to us and we&apos;ll help you resolve it quickly.
            </p>
          </div>

        </div>
        <p className="text-center text-xs text-gray-700 mt-8">&copy; {new Date().getFullYear()} RohitGMSSO Academy. All rights reserved.</p>
      </div>
    </footer>
  )
}
