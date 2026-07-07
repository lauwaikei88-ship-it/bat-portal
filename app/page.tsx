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
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

            <p className="mt-4 text-sm text-[#80959C]">No credit card required.</p>
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

              {/* Progress bar */}
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

      {/* ── PLATFORMS ── */}
      <section className="border-b border-[#D9DFE1] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-[#80959C]">
          <span className="text-xs font-bold uppercase tracking-widest mr-4">Works with</span>
          <div className="flex items-center gap-5">
            <IgIcon />
            <FbIcon />
            <XIcon />
          </div>
          <span className="text-xs text-[#BFCACE] ml-2">and more</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#012B3A] mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Share2 size={22} />, step: '1', title: 'Connect your accounts', desc: 'Link your social profiles in seconds. No technical setup needed.' },
              { icon: <CalendarDays size={22} />, step: '2', title: 'Plan your content', desc: 'Write your posts and set the exact date and time for each one.' },
              { icon: <Clock size={22} />, step: '3', title: 'Posts go live automatically', desc: 'Walk away. Your posts publish on schedule, every time.' },
            ].map(item => (
              <div key={item.step} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: '#007978' }}>
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#012B3A] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#41606B] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-[#F7F9F9] border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#012B3A] mb-12">What's included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <CalendarDays size={20} />, title: 'Content calendar', desc: 'See all your scheduled posts in a clear weekly or monthly view.' },
              { icon: <Share2 size={20} />, title: 'Multi-platform posting', desc: 'Post to multiple accounts from one place — no switching tabs.' },
              { icon: <BarChart2 size={20} />, title: 'Post analytics', desc: 'See how each post performs once it goes live.' },
              { icon: <Clock size={20} />, title: 'Scheduled publishing', desc: 'Set your post time and let the app handle the rest.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 bg-white border border-[#D9DFE1] rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[#007978]"
                  style={{ backgroundColor: '#DFFFDE' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#012B3A] mb-1 text-sm">{f.title}</h3>
                  <p className="text-sm text-[#41606B] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 border-b border-[#D9DFE1]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#012B3A] mb-3">Simple pricing</h2>
          <p className="text-[#41606B] mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">

            {/* Free */}
            <div className="border border-[#D9DFE1] rounded-xl p-8 bg-white flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-[#80959C] mb-3">Beta Access</div>
              <div className="text-4xl font-bold text-[#012B3A] mb-1">Free</div>
              <p className="text-sm text-[#41606B] mb-7">Everything you need to get started.</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Manage up to 3 social accounts',
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
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#012B3A' }}>
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 rounded-xl p-8 bg-[#012B3A] text-white flex flex-col" style={{ borderColor: '#012B3A' }}>
              <div className="text-xs font-bold uppercase tracking-widest text-[#BFCACE] mb-3">Pro — Yearly</div>
              <div className="text-4xl font-bold text-white mb-1">Custom</div>
              <p className="text-sm text-[#80959C] mb-7">Need more accounts? Email us.</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Manage up to 10 social accounts',
                  'Everything in Beta Access',
                  'Priority email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white font-medium">
                    <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: '#DFFFDE' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app"
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                <Mail size={16} />
                Email us to upgrade
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-[#F7F9F9]">
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
          <p className="mt-4 text-sm text-[#80959C]">No credit card required.</p>
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
