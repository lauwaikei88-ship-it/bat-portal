'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  CalendarDays,
  Share2,
  BarChart2,
  Clock,
  Zap,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';

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

  const spotsLeft = testerCount !== null ? Math.max(0, 50 - testerCount) : null;
  const progressPct = testerCount !== null ? Math.min(100, (testerCount / 50) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#0a0f1e' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: 'rgba(10,15,30,0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white text-lg tracking-tight">Post 2 Post</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login"
              className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5">
              Log In
            </Link>
            <Link href="/signup"
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-32 overflow-hidden">
        {/* background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#3b82f6 0%,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-40 -left-32 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#06b6d4 0%,transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8"
            style={{ background: 'rgba(59,130,246,0.1)' }}>
            <Sparkles size={13} />
            <span>Exclusive Beta — 50 Spots Only</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.08]">
            Plan once,{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }}>
              post anytime.
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-12 max-w-xl leading-relaxed">
            Schedule your social media posts across multiple platforms in one place.
            Simple, focused, and built for creators who actually ship.
          </p>

          {/* Platform icons row */}
          <div className="flex items-center gap-4 mb-14 text-slate-500">
            <Instagram size={22} />
            <Facebook size={22} />
            <Twitter size={22} />
            <span className="text-xs font-medium tracking-widest text-slate-600 ml-1">AND MORE</span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-900/40 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              Join the Beta — It&apos;s Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center px-8 py-4 text-slate-300 rounded-2xl font-semibold text-lg border border-white/10 hover:border-white/20 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              Log In
            </Link>
          </div>

          {/* Live Counter Card */}
          <div className="relative group w-full max-w-sm">
            <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-sm pointer-events-none"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }} />
            <div className="relative rounded-2xl p-7 border border-white/10" style={{ background: '#111827' }}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Beta Tester Spots</p>

              {/* count */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-white">
                  {testerCount !== null ? testerCount : '—'}
                </span>
                <span className="text-2xl font-medium text-slate-500">/ 50 joined</span>
              </div>

              {/* progress bar */}
              <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ background: '#1f2937' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }}
                />
              </div>

              {spotsLeft !== null && (
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {spotsLeft} spots remaining
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-600 font-medium">No credit card required.</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-16">
            From idea to published in 3 steps
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Share2 size={24} />,
                step: '01',
                title: 'Connect your accounts',
                desc: 'Link your social profiles — Instagram, Facebook, and more — in seconds.',
              },
              {
                icon: <CalendarDays size={24} />,
                step: '02',
                title: 'Plan your content',
                desc: 'Write your posts and pick the exact dates and times you want them live.',
              },
              {
                icon: <Clock size={24} />,
                step: '03',
                title: 'Post goes live automatically',
                desc: 'Sit back. Your scheduled posts publish on time, every time.',
              },
            ].map(item => (
              <div key={item.step}
                className="rounded-2xl p-8 border border-white/5 hover:border-blue-500/20 transition-all"
                style={{ background: '#111827' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.1)' }}>
                    {item.icon}
                  </div>
                  <span className="text-4xl font-extrabold text-white/5">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-16">
            Everything you need. Nothing you don&apos;t.
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: <CalendarDays size={20} />, title: 'Visual Content Calendar', desc: 'See all your scheduled posts in a clean weekly or monthly view.' },
              { icon: <Share2 size={20} />, title: 'Multi-Platform Publishing', desc: 'Post to multiple social accounts from a single composer.' },
              { icon: <BarChart2 size={20} />, title: 'Post Analytics', desc: 'Track how each post performs after it goes live.' },
              { icon: <Zap size={20} />, title: 'Smart Scheduling', desc: 'Set it and forget it — your posts go out at exactly the right time.' },
            ].map(f => (
              <div key={f.title}
                className="flex gap-5 p-7 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all"
                style={{ background: '#111827' }}>
                <div className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center text-blue-400"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-center text-slate-400 mb-16">Start free. Grow when you&apos;re ready.</p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Free Tier */}
            <div className="rounded-3xl p-9 border border-white/10 flex flex-col" style={{ background: '#111827' }}>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Beta Access</div>
              <div className="text-5xl font-extrabold text-white mb-1">Free</div>
              <p className="text-slate-400 mb-8 text-sm">Try Post 2 Post during the beta — no strings attached.</p>

              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Manage up to 3 social accounts',
                  'Visual content calendar',
                  'Multi-platform post scheduling',
                  'Post analytics',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 size={17} className="text-blue-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                Get Started Free
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Pro / Yearly */}
            <div className="rounded-3xl p-9 border border-white/5 flex flex-col relative overflow-hidden" style={{ background: '#0d1117' }}>
              {/* top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />

              <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3">Pro — Yearly</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-white">Custom</span>
              </div>
              <p className="text-slate-400 mb-8 text-sm">Need more than 3 accounts? Email us and we&apos;ll sort you out.</p>

              <ul className="space-y-3.5 mb-10 flex-1">
                {[
                  'Manage up to 10 social accounts',
                  'Everything in Beta Access',
                  'Priority email support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 size={17} className="text-sky-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:hello@post2post.app"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                <Mail size={18} />
                Email us to upgrade
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to plan once and{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }}>
              post anytime?
            </span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg">Join {testerCount !== null ? testerCount : '...'} creators already in the beta.</p>
          <Link href="/signup"
            className="group inline-flex items-center gap-2 px-10 py-4 text-white rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
            Claim Your Free Spot
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-slate-600">Only {spotsLeft !== null ? spotsLeft : '...'} spots left. No credit card needed.</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded" />
            <span className="font-semibold text-slate-500">Post 2 Post</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <a href="mailto:hello@post2post.app" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
          <p>© 2025 Post 2 Post. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
