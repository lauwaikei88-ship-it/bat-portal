'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Mail } from 'lucide-react';

export default function LandingPage() {
  const [testerCount, setTesterCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/testers/count')
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setTesterCount(data.count);
        }
      })
      .catch(err => console.error('Error fetching count:', err));
  }, []);

  const spotsLeft = testerCount !== null ? Math.max(0, 50 - testerCount) : '...';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f0f4fa]">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm border border-slate-200" />
          <span className="font-bold text-slate-800 text-lg tracking-tight">Post 2 Post</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-200">
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles size={14} />
          <span>Exclusive Beta Program</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl">
          Plan once,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">post anytime.</span>
        </h1>
        
        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          The ultimate AI-powered social media scheduler. Connect your accounts, generate engaging content, and automate your presence across all platforms.
        </p>

        {/* Live Counter Widget */}
        <div className="mb-12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white border border-slate-100 px-8 py-6 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Beta Tester Spots</p>
            <div className="text-5xl font-bold text-slate-800 flex items-baseline gap-2">
              <span className="text-blue-600">{testerCount !== null ? testerCount : '-'}</span> 
              <span className="text-3xl text-slate-400 font-medium">/ 50</span>
            </div>
            {testerCount !== null && (
              <p className="mt-3 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                {spotsLeft} spots remaining
              </p>
            )}
          </div>
        </div>

        <Link href="/signup" className="group flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Join the Beta Now
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-4 text-sm text-slate-400 font-medium">No credit card required.</p>

        {/* Pricing Info */}
        <div className="mt-24 w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-8 text-left">
          
          {/* Free Tier */}
          <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] text-slate-900 pointer-events-none"><Sparkles size={240} /></div>
            <div className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Beta Access</div>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-3">Free</h3>
            <p className="text-slate-500 mb-8 font-medium">Experience the magic of Post 2 Post.</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-blue-500 flex-shrink-0" /> Manage up to <strong>3 social accounts</strong></li>
              <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-blue-500 flex-shrink-0" /> Unlimited AI content generation</li>
              <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="text-blue-500 flex-shrink-0" /> Media library & scheduling</li>
            </ul>
          </div>

          {/* Pro / Agency */}
          <div className="bg-slate-900 p-10 rounded-[2rem] border border-slate-800 shadow-lg relative overflow-hidden text-slate-300">
            <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] text-white pointer-events-none"><Mail size={240} /></div>
            <div className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-3">Pro & Agency</div>
            <h3 className="text-3xl font-extrabold text-white mb-3">Need more capacity?</h3>
            <p className="text-slate-400 mb-8 font-medium">Scale up to 10+ accounts for your business.</p>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-sky-400 flex-shrink-0" /> Manage <strong>10+ social accounts</strong></li>
              <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-sky-400 flex-shrink-0" /> Dedicated support & onboarding</li>
              <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-sky-400 flex-shrink-0" /> Custom integration solutions</li>
            </ul>

            <a href="mailto:hello@post2post.com" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors w-full sm:w-auto">
              <Mail size={18} />
              Email us to upgrade
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
