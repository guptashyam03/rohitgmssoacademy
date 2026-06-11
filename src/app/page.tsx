import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedHeroText from '@/components/ui/AnimatedHeroText'
import { BookOpen, Video, ClipboardList, Shield, Zap, Users, ArrowRight, Star, CheckCircle, MessageCircle, Send } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-950 border border-primary-800 text-primary-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <Star size={12} fill="currentColor" /> Health Beyond Medicine
          </div>
          <AnimatedHeroText />
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Premium learning platform for MSSO, Medical Social Work &amp; Psychiatric Social Work aspirants — PDF notes, video lectures, and timed mock tests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store" className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              View Plans &amp; Pricing <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl transition">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Everything you need to succeed</h2>
            <p className="text-gray-500">One platform. All the tools. Zero distractions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEFT — content features */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* PDF Notes */}
              <div className="h-[200px] bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col justify-between group hover:border-primary-700 transition-colors overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition" />
                <div className="w-12 h-12 bg-blue-900/50 border border-blue-800 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">PDF Notes</h3>
                  <p className="text-gray-500 text-sm">High-quality curated notes viewable in-browser. Study anytime, anywhere without downloading.</p>
                </div>
              </div>

              {/* Mock Tests + Video Lectures */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-[200px] bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col justify-between group hover:border-purple-700 transition-colors relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/20 transition" />
                  <div className="w-12 h-12 bg-purple-900/50 border border-purple-800 rounded-xl flex items-center justify-center">
                    <ClipboardList size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Mock Tests</h3>
                    <p className="text-gray-500 text-sm">Timed MCQ tests with instant grading, explanations &amp; attempt history.</p>
                  </div>
                </div>

                <div className="h-[200px] bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col justify-between group hover:border-green-700 transition-colors relative overflow-hidden">
                  <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-green-600/10 rounded-full blur-xl group-hover:bg-green-600/20 transition" />
                  <div className="w-12 h-12 bg-green-900/50 border border-green-800 rounded-xl flex items-center justify-center">
                    <Video size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Video Lectures</h3>
                    <p className="text-gray-500 text-sm">Expert-recorded lectures embedded directly in the platform.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — trust highlights */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 border border-primary-700 rounded-2xl p-7 flex flex-col justify-between">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-white">5,000+</p>
                  <p className="text-primary-200 text-sm mt-1">Students enrolled and growing</p>
                </div>
              </div>

              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col justify-between group hover:border-yellow-700 transition-colors">
                <div className="w-12 h-12 bg-yellow-900/50 border border-yellow-800 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Instant Access</p>
                  <p className="text-gray-500 text-sm">Unlock everything the moment you purchase. No waiting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Get started in 3 steps</h2>
            <p className="text-gray-500">From sign-up to studying in under 2 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create an Account',
                desc: 'Sign up free with your email. No credit card needed to register.',
                icon: Users,
                color: 'text-primary-400',
                bg: 'bg-primary-900/40 border-primary-800',
              },
              {
                step: '02',
                title: 'Choose a Plan',
                desc: 'Pick PDFs, Mock Tests, or the Premium bundle — one-time payment, lifetime access.',
                icon: Shield,
                color: 'text-green-400',
                bg: 'bg-green-900/40 border-green-800',
              },
              {
                step: '03',
                title: 'Start Learning',
                desc: 'Instantly access your notes, videos, and mock tests from your dashboard.',
                icon: CheckCircle,
                color: 'text-purple-400',
                bg: 'bg-purple-900/40 border-purple-800',
              },
            ].map(({ step, title, desc, icon: Icon, color, bg }) => (
              <div key={step} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-700 transition">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${bg}`}>
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 tracking-widest uppercase mb-1">Step {step}</p>
                  <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/store" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl transition">
              View Plans &amp; Pricing <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* General Queries */}
      <section className="py-16 px-4 border-t border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Have a question?</h2>
            <p className="text-gray-500">Reach out to us directly on Telegram — we're always happy to help.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: 'Join the Group',
                desc: 'Stay updated with announcements, tips, and batch discussions.',
                href: 'https://t.me/rohitguptamsso',
                color: 'border-blue-800 hover:border-blue-600',
                iconBg: 'bg-blue-900/50 border-blue-800',
                iconColor: 'text-blue-400',
              },
              {
                label: 'Personal Chat',
                desc: 'One-on-one query? Message us directly for personalized help.',
                href: 'https://t.me/rohitgpsw',
                color: 'border-green-800 hover:border-green-600',
                iconBg: 'bg-green-900/50 border-green-800',
                iconColor: 'text-green-400',
              },
              {
                label: 'Technical Support',
                desc: 'Facing a technical issue with the platform? We\'ll fix it fast.',
                href: 'https://t.me/guptashyam03',
                color: 'border-purple-800 hover:border-purple-600',
                iconBg: 'bg-purple-900/50 border-purple-800',
                iconColor: 'text-purple-400',
              },
            ].map(({ label, desc, href, color, iconBg, iconColor }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gray-900 border rounded-2xl p-6 flex flex-col gap-4 transition ${color}`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBg}`}>
                  <Send size={20} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Telegram</p>
                  <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 ${iconColor}`}>
                  <MessageCircle size={13} /> Open in Telegram
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
