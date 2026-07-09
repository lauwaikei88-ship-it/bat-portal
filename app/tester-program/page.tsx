'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Globe, Gift, Mail, ShieldCheck } from 'lucide-react';

export default function TesterProgramPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800" style={{ fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }}>
      
      {/* ── NAV ── */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors font-semibold text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-green-200 bg-green-50 text-green-700">
            Tester Program
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Join the Post 2 Post <span className="text-green-600">Tester Group</span>
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            We are currently in a closed testing phase. To ensure the best experience and verify all systems are stable, we are onboarding early users manually.
          </p>

          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6 hover:border-green-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Users className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Contact us to get added</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Because our Meta (Facebook/Instagram) integration is currently in "Development Mode", we must manually whitelist your Facebook account before you can connect it.
                </p>
                <a href="mailto:airdriveteam@hotmail.com?subject=Join Tester Program" className="inline-flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-5 py-2.5 rounded-lg transition-colors">
                  <Mail size={16} />
                  Email us to join
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6 hover:border-green-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Globe className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. The road to our own domain</h3>
                <p className="text-gray-600 leading-relaxed">
                  Right now, we are testing everything on a secure staging environment. Once we hit our stability targets and pass Meta's official App Review process, we will fully launch on our own custom domain and open public registration.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-md flex flex-col md:flex-row gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-10"></div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Gift className="text-green-700" size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded mb-3">
                  <ShieldCheck size={14} /> Tester Reward
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Exclusive Tester Benefits</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When we officially launch, our standard price will be <span className="line-through text-gray-400">$60/year</span>. However, as a thank you for helping us shape the future of Post 2 Post, our first 50 early testers will lock in a guaranteed <span className="font-bold text-green-700">50% lifetime discount ($30/year)</span>, plus even more exclusive perks and priority feature requests as we grow.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-16 pt-12 border-t border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to help us test?</h2>
            <p className="text-gray-600 mb-8">We're only accepting a limited number of testers in this initial phase.</p>
            <a href="mailto:airdriveteam@hotmail.com?subject=Join Tester Program" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-lg transition-colors hover:opacity-90 shadow-sm" style={{ backgroundColor: '#16a34a' }}>
              <Mail size={16} />
              Apply for Tester Access
            </a>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Post 2 Post.</p>
        </div>
      </footer>
    </div>
  );
}
