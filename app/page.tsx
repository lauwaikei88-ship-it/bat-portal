'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, CalendarDays, Share2, BarChart2, Clock } from 'lucide-react';

// Brand icons as inline SVGs
const IgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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
  const progressPct = testerCount !== null ? Math.min(100, (testerCount / 50) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#012B3A]" style={{ fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── NAV ── */}
      <header className="border-b border-[#D9DFE1] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Post 2 Post" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-[#012B3A] text-lg">Post 2 Post</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-[#012B3A] hover:bg-[#F2F4F5] rounded-lg transition-colors">
              Log in
            </Link>
            <Link href="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#012B3A' }}>
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#F7F9F9] border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">

          {/* Left copy */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-[#D9DFE1] bg-white text-[#41606B]">
              Beta Program · 50 spots
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#012B3A] leading-tight mb-5">
              Plan once,<br />
              <span style={{ color: '#007978' }}>post anytime.</span>
            </h1>

            <p className="text-lg text-[#41606B] mb-8 max-w-lg leading-relaxed">
              Schedule your content across multiple social accounts — all from one simple dashboard.
            </p>

            {/* Platforms row */}
            <div className="flex items-center gap-4 mb-8 text-[#80959C]">
              <span className="text-xs font-bold uppercase tracking-widest">Works with</span>
              <IgIcon />
              <FbIcon />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#012B3A' }}>
                Get started free
                <ArrowRight size={16} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-bold text-[#012B3A] rounded-lg border border-[#D9DFE1] bg-white hover:bg-[#F2F4F5] transition-colors">
                Log in
              </Link>
            </div>
          </div>

          {/* Right: live counter */}
          <div className="flex-shrink-0 w-full md:w-72">
            <div className="bg-white border border-[#D9DFE1] rounded-2xl p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-1">Beta Spots Taken</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold text-[#012B3A]">
                  {testerCount !== null ? testerCount : '—'}
                </span>
                <span className="text-xl text-[#BFCACE] font-medium">/ 50</span>
              </div>

              <div className="w-full h-2 rounded-full bg-[#F2F4F5] mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, backgroundColor: '#007978' }}
                />
              </div>

              {spotsLeft !== null && (
                <p className="text-sm font-semibold text-[#007978] flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#007978' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#007978' }} />
                  </span>
                  {spotsLeft} spots remaining
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#012B3A] mb-4">How it works</h2>
          <p className="text-[#41606B] mb-16 max-w-xl">Three simple steps — from setup to your first scheduled post in minutes.</p>

          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
            <div className="flex-1">
              <div className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-white text-sm font-bold mb-5" style={{ backgroundColor: '#007978' }}>1</div>
              <h3 className="text-xl font-bold text-[#012B3A] mb-3">Connect your social accounts</h3>
              <p className="text-[#41606B] leading-relaxed max-w-sm">
                Link your Instagram and Facebook pages in seconds. No complicated setup — just authorise and you're ready.
              </p>
            </div>
            {/* Mockup card */}
            <div className="flex-1 w-full">
              <div className="bg-[#F7F9F9] border border-[#D9DFE1] rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-4">Connected accounts</p>
                <div className="space-y-3">
                  {[
                    { name: 'Instagram', handle: '@yourbrand', color: '#E1306C' },
                    { name: 'Facebook', handle: 'Your Page', color: '#1877F2' },
                  ].map(acc => (
                    <div key={acc.name} className="flex items-center gap-3 bg-white border border-[#D9DFE1] rounded-xl px-4 py-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: acc.color }}>
                        {acc.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#012B3A]">{acc.name}</p>
                        <p className="text-xs text-[#80959C]">{acc.handle}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#007978' }} />
                        <span className="text-xs text-[#007978] font-semibold">Connected</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 border border-dashed border-[#D9DFE1] rounded-xl px-4 py-3 text-[#BFCACE] text-sm">
                    + Add another account
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 mb-20">
            <div className="flex-1">
              <div className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-white text-sm font-bold mb-5" style={{ backgroundColor: '#007978' }}>2</div>
              <h3 className="text-xl font-bold text-[#012B3A] mb-3">Write your post and pick a time</h3>
              <p className="text-[#41606B] leading-relaxed max-w-sm">
                Type your caption, select which accounts to post to, and choose when it should go live. That's it.
              </p>
            </div>
            {/* Mockup card */}
            <div className="flex-1 w-full">
              <div className="bg-[#F7F9F9] border border-[#D9DFE1] rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-4">New post</p>
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 mb-3 text-sm text-[#41606B] min-h-[72px]">
                  Excited to share our latest update with you all! 🚀 Stay tuned for more.
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DFE1] rounded-lg bg-white text-xs font-semibold text-[#012B3A]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E1306C' }} />
                    Instagram
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D9DFE1] rounded-lg bg-white text-xs font-semibold text-[#012B3A]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1877F2' }} />
                    Facebook
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#80959C]">📅 Tomorrow, 9:00 AM</div>
                  <div className="px-4 py-2 text-xs font-bold text-white rounded-lg" style={{ backgroundColor: '#007978' }}>Schedule</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-white text-sm font-bold mb-5" style={{ backgroundColor: '#007978' }}>3</div>
              <h3 className="text-xl font-bold text-[#012B3A] mb-3">Your post goes live automatically</h3>
              <p className="text-[#41606B] leading-relaxed max-w-sm">
                Sit back. Post 2 Post publishes your content on time — every time. No reminders, no manual posting.
              </p>
            </div>
            {/* Mockup card */}
            <div className="flex-1 w-full">
              <div className="bg-[#F7F9F9] border border-[#D9DFE1] rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-4">This week</p>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-bold text-[#80959C] py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[null, null, null, null, null, null, null].map((_, i) => (
                    <div key={i} className={`rounded-lg h-10 flex items-center justify-center text-xs font-semibold ${i === 0 || i === 2 || i === 4 ? 'text-white' : 'bg-[#F2F4F5] text-[#BFCACE]'}`}
                      style={i === 0 || i === 2 || i === 4 ? { backgroundColor: '#007978' } : {}}>
                      {i === 0 || i === 2 || i === 4 ? '✓' : ''}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#007978] font-semibold mt-4">3 posts published this week</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 bg-[#F7F9F9] border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#012B3A] mb-3">Simple pricing</h2>
          <p className="text-[#41606B] mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <div className="border border-[#D9DFE1] rounded-xl p-8 bg-white flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-3">Beta Access</div>
              <div className="text-4xl font-bold text-[#012B3A] mb-1">Free</div>
              <p className="text-sm text-[#41606B] mb-7">Try it out during the beta.</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '3 social accounts',
                  'Content calendar',
                  'Multi-platform scheduling',
                  'Post analytics',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#012B3A] font-medium">
                    <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#007978' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#012B3A] rounded-lg border border-[#D9DFE1] hover:bg-[#F2F4F5] transition-colors">
                Get started free
              </Link>
            </div>

            {/* Yearly — highlighted */}
            <div className="rounded-xl p-8 bg-[#012B3A] text-white flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#007978' }}>
                Most popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#BFCACE] mb-3">Pro — Yearly</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-white">$30</span>
                <span className="text-[#80959C] text-sm font-medium">/ year</span>
              </div>
              <p className="text-sm text-[#80959C] mb-7">Best value for serious creators.</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '10 social accounts',
                  'Everything in Beta Access',
                  'Priority email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white font-medium">
                    <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#DFFFDE' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app?subject=Pro Plan"
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#012B3A] bg-white rounded-lg hover:bg-[#F2F4F5] transition-colors">
                <Mail size={15} />
                Email us to upgrade
              </a>
            </div>

            {/* Agency */}
            <div className="border border-[#D9DFE1] rounded-xl p-8 bg-white flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-3">Agency</div>
              <div className="text-4xl font-bold text-[#012B3A] mb-1">Custom</div>
              <p className="text-sm text-[#41606B] mb-7">Need more than 10 accounts?</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited social accounts',
                  'Everything in Pro',
                  'Custom setup support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#012B3A] font-medium">
                    <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#007978' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app?subject=Agency Plan"
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#012B3A] rounded-lg border border-[#D9DFE1] hover:bg-[#F2F4F5] transition-colors">
                <Mail size={15} />
                Email us
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-[#012B3A] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[#41606B] mb-8">
            Join {testerCount !== null ? testerCount : '...'} creators already in the beta.
            {spotsLeft !== null && ` Only ${spotsLeft} spots left.`}
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#012B3A' }}>
            Sign up free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#D9DFE1] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#80959C]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Post 2 Post" className="w-6 h-6 rounded" />
            <span className="font-semibold text-[#41606B]">Post 2 Post</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#012B3A] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#012B3A] transition-colors">Terms</Link>
            <a href="mailto:hello@post2post.app" className="hover:text-[#012B3A] transition-colors">Contact</a>
          </div>
          <p>© 2025 Post 2 Post.</p>
        </div>
      </footer>

    </div>
  );
}
