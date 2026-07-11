'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Plus, Check } from 'lucide-react';

// Brand icons as inline SVGs
const IgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-[#E1306C] transition-colors">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-[#1877F2] transition-colors">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 hover:text-black transition-colors">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default function LandingPage() {
  const [testerCount, setTesterCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/testers/count')
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') setTesterCount(data.count);
      })
      .catch(err => console.error('Error fetching count:', err));
  }, []);

  const spotsLeft = testerCount !== null ? Math.max(0, 50 - testerCount) : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-zinc-200">
      
      {/* ── GLOBAL ANNOUNCEMENT BAR ── */}
      <div className="bg-emerald-500 text-white text-xs font-bold text-center py-2 px-4 tracking-wide z-50 relative">
        Beta Program — Only {spotsLeft !== null ? spotsLeft : '...'} spots remaining
      </div>

      {/* ── NAV ── */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Post 2 Post" className="w-8 h-8 rounded-lg grayscale" />
            <span className="font-extrabold text-zinc-900 text-lg tracking-tight">Post 2 Post</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors active:scale-[0.98]">
              Log in
            </Link>
            <Link href="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all active:scale-[0.98]">
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white border-b border-zinc-200 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-16">

          {/* Left copy */}
          <div className="flex-1 text-left relative z-10 transition-all duration-1000 ease-out translate-y-0 opacity-100">
            <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 leading-[1.05] tracking-tighter mb-6">
              Plan once,<br />
              post anytime.
            </h1>

            <p className="text-lg text-zinc-500 mb-10 max-w-md leading-relaxed font-medium">
              Schedule your content across multiple social accounts — all from one sleek command center.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-zinc-200/50">
                Get started free
                <ArrowRight size={16} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-zinc-900 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-all active:scale-[0.98]">
                View Demo
              </Link>
            </div>

            {/* Platforms row */}
            <div className="flex items-center gap-5 text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Works with</span>
              <IgIcon />
              <FbIcon />
              <XIcon />
            </div>
          </div>

          {/* Right: Video Frame Mockup */}
          <div className="flex-1 w-full relative perspective-1000">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] transform rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
              {/* Browser Top Bar */}
              <div className="flex gap-1.5 pb-2 pl-2 pt-1">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300"></div>
              </div>
              {/* The Actual Video */}
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full rounded-lg border border-zinc-200 bg-white"
              >
                <source src="/Adv_p2p_1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS (Bento Grid) ── */}
      <section className="py-32 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">How it works</h2>
            <p className="text-zinc-500 max-w-xl text-lg font-medium">Three simple steps — from setup to your first scheduled post in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Connect */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 shadow-inner flex flex-col group hover:border-zinc-300 transition-colors">
              <div className="text-zinc-900 font-extrabold text-xl mb-2">1. Connect</div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Link your pages in seconds.</p>
              
              <div className="mt-auto relative bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500"><IgIcon /></div>
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500"><FbIcon /></div>
                 </div>
                 <button className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg w-full mt-2">Connect Accounts</button>
              </div>
            </div>

            {/* Box 2: Write */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 shadow-inner flex flex-col group hover:border-zinc-300 transition-colors">
              <div className="text-zinc-900 font-extrabold text-xl mb-2">2. Write</div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Type once, preview everywhere.</p>
              
              <div className="mt-auto bg-white border border-zinc-200 rounded-xl p-4">
                <div className="border border-zinc-200 rounded-lg p-3 text-xs text-zinc-400 mb-3 h-20 bg-zinc-50 font-mono">
                  Excited to share our latest update! 🚀
                  <span className="animate-pulse">|</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                     <span className="w-4 h-4 rounded-full bg-zinc-200"></span>
                     <span className="w-4 h-4 rounded-full bg-zinc-200"></span>
                   </div>
                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tomorrow 9AM</div>
                </div>
              </div>
            </div>

            {/* Box 3: Done */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 shadow-inner flex flex-col group hover:border-zinc-300 transition-colors">
              <div className="text-zinc-900 font-extrabold text-xl mb-2">3. Done</div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Your post goes live automatically.</p>
              
              <div className="mt-auto bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                   <Check size={24} strokeWidth={3} />
                 </div>
                 <div className="text-sm font-bold text-zinc-900">Success! Published</div>
                 <div className="text-xs text-zinc-400 mt-1">3 platforms updated</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-32 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">Simple pricing</h2>
            <p className="text-zinc-500 text-lg font-medium">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">

            {/* Free */}
            <div className="border border-zinc-200 rounded-2xl p-8 bg-zinc-50 flex flex-col hover:border-zinc-300 transition-colors">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Beta Access</div>
              <div className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">Free</div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Try it out during the beta.</p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  '3 social accounts',
                  'Content calendar',
                  'Multi-platform scheduling',
                  'Post analytics',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                    <Check size={16} className="text-zinc-900 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-zinc-900 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98]">
                Get started free
              </Link>
            </div>

            {/* Yearly — Pro Card (Slightly larger, 2px border) */}
            <div className="border-2 border-zinc-900 rounded-2xl p-10 bg-white flex flex-col relative md:scale-105 shadow-xl z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold text-white bg-zinc-900 uppercase tracking-widest">
                Most popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Pro — Yearly</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">$30</span>
                <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">/ year</span>
              </div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Best value for serious creators.</p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  '10 social accounts',
                  'Everything in Beta Access',
                  'Priority email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-900 font-medium">
                    <Plus size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app?subject=Pro Plan"
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-zinc-900 bg-white border border-zinc-900 rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98]">
                <Mail size={16} />
                Email to upgrade
              </a>
            </div>

            {/* Agency */}
            <div className="border border-zinc-200 rounded-2xl p-8 bg-zinc-50 flex flex-col hover:border-zinc-300 transition-colors">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Agency</div>
              <div className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">Custom</div>
              <p className="text-sm text-zinc-500 mb-8 font-medium">Need more than 10 accounts?</p>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Unlimited social accounts',
                  'Everything in Pro',
                  'Custom setup support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-700 font-medium">
                    <Check size={16} className="text-zinc-900 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app?subject=Agency Plan"
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-zinc-900 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98]">
                <Mail size={16} />
                Email us
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-zinc-500 mb-10 text-lg font-medium">
            Join {testerCount !== null ? testerCount : '...'} creators already in the beta.
            {spotsLeft !== null && ` Only ${spotsLeft} spots left.`}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-200/50">
              Sign up free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500 font-medium">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Post 2 Post" className="w-6 h-6 rounded grayscale" />
            <span className="font-bold text-zinc-900 tracking-tight">Post 2 Post</span>
          </div>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
            <a href="mailto:hello@post2post.app" className="hover:text-zinc-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-zinc-700">All systems operational</span>
            </div>
          </div>
          <p className="md:ml-auto">© 2026 Post 2 Post.</p>
        </div>
      </footer>

    </div>
  );
}
