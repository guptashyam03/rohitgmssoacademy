import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BookOpen, Video, ClipboardList, Shield, Zap, Users, ArrowRight, Star } from 'lucide-react'

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
            <Star size={12} fill="currentColor" /> Premium Learning Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Learn Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Score Higher.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Access premium PDF notes, video lectures, and timed mock tests — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/store" className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              Browse Content <ArrowRight size={18} />
            </Link>
            <Link href="/plans" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-3.5 rounded-xl transition">
              View Plans
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
            {/* LEFT SIDE — content features (2/3 width) */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* PDF Notes — full width */}
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

              {/* Mock Tests + Video Lectures — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-[200px] bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col justify-between group hover:border-purple-700 transition-colors relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/20 transition" />
                  <div className="w-12 h-12 bg-purple-900/50 border border-purple-800 rounded-xl flex items-center justify-center">
                    <ClipboardList size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Mock Tests</h3>
                    <p className="text-gray-500 text-sm">Timed MCQ tests with instant grading, explanations & attempt history.</p>
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

            {/* RIGHT SIDE — stats & highlights (1/3 width) */}
            <div className="flex flex-col gap-4">
              {/* 5,000+ Students */}
              <div className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 border border-primary-700 rounded-2xl p-7 flex flex-col justify-between">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-white">5,000+</p>
                  <p className="text-primary-200 text-sm mt-1">Students enrolled and growing</p>
                </div>
              </div>

              {/* Instant Access */}
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

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Simple, Flexible Plans</h2>
            <p className="text-gray-500">Choose what works for you. Upgrade anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'PDF Notes',  features: ['All PDF notes', 'In-browser viewer', 'Lifetime access'], highlight: false, color: 'blue' },
              { name: 'Premium',    features: ['PDFs + Videos + Tests', 'Unlimited mock tests', 'Score analytics', 'Priority support'], highlight: true, color: 'primary' },
              { name: 'Mock Tests', features: ['All mock tests', 'Instant grading', 'Explanation per question', 'Attempt history'], highlight: false, color: 'purple' },
            ].map(({ name, features, highlight }) => (
              <div key={name} className={`rounded-2xl p-7 border flex flex-col ${highlight ? 'bg-primary-600 border-primary-500 shadow-xl shadow-primary-900/30 scale-105' : 'bg-gray-900 border-gray-800'}`}>
                {highlight && <div className="text-xs font-bold text-primary-200 bg-white/20 rounded-full px-3 py-1 w-fit mb-4">MOST POPULAR</div>}
                <h3 className={`text-xl font-bold mb-5 ${highlight ? 'text-white' : 'text-white'}`}>{name}</h3>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-primary-100' : 'text-gray-400'}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${highlight ? 'bg-white/25 text-white' : 'bg-primary-900 text-primary-400'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/plans" className={`block text-center font-semibold py-2.5 rounded-xl transition ${highlight ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users,  stat: '5,000+',  label: 'Students Enrolled' },
              { icon: Shield, stat: '100%',    label: 'Secure Payments' },
              { icon: Zap,    stat: 'Instant', label: 'Access After Purchase' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon size={24} className="text-primary-500" />
                <p className="text-2xl font-bold text-white">{stat}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
