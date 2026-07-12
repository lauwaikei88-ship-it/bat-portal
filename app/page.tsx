'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Plus, Check, Sparkles, Send } from 'lucide-react';

// Brand icons as inline SVGs
const IgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-pink-500 transition-colors duration-300">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-sky-500 transition-colors duration-300">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 hover:text-slate-800 transition-colors duration-300">
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

  // Reusable card class for crystal white aesthetic
  const acrylicCard = "bg-white border border-slate-200 shadow-sm rounded-[2rem] relative";
  const acrylicButton = "bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow transition-all duration-300 text-slate-700 font-semibold rounded-2xl";
  const primaryButton = "bg-sky-500 text-white font-bold shadow-sm hover:bg-sky-600 hover:shadow hover:-translate-y-1 transition-all duration-300 rounded-2xl";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-sky-200 selection:text-sky-900 relative">
      
      {/* ── GLOBAL ANNOUNCEMENT BAR ── */}
      <div className="bg-slate-50 border-b border-slate-100 text-teal-700 text-xs font-bold text-center py-2.5 px-4 tracking-wide z-50 relative flex justify-center items-center gap-2">
        <Sparkles size={14} className="text-teal-500" />
        Beta Program — Only {spotsLeft !== null ? spotsLeft : '...'} spots remaining
        <Sparkles size={14} className="text-teal-500" />
      </div>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-contain shadow-sm border border-slate-100" />
            <span className="font-extrabold text-slate-800 text-xl tracking-tight">Post 2 Post</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className={`px-6 py-2.5 text-sm ${acrylicButton}`}>
              Log in
            </Link>
            <Link href="/signup"
              className={`px-6 py-2.5 text-sm ${primaryButton}`}>
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 overflow-hidden pt-6 pb-10 md:pt-10 md:pb-12">
        <div className="gumball-capsule"></div>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">

          {/* Left copy */}
          <div className="flex-1 text-left relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-[1.05] tracking-tighter mb-4">
              Plan once,<br />
              <span className="text-sky-500">post anytime.</span>
            </h1>

            <p className="text-lg text-slate-500 mb-6 max-w-lg leading-relaxed font-medium">
              Schedule your content across multiple social accounts with a tool that feels as refreshing as breathing clear air.
            </p>

            <div className="flex flex-row flex-wrap items-center gap-4 mb-8">
              <Link href="/signup"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm ${primaryButton}`}>
                Get started free
                <ArrowRight size={16} />
              </Link>
              
              {/* Platforms row */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Works with</span>
                <div className="w-px h-3 bg-slate-300/50"></div>
                <FbIcon />
                <IgIcon />
              </div>
            </div>
          </div>

          {/* Right: Video Frame Mockup */}
          <div className="flex-1 w-full max-w-sm mx-auto relative perspective-1000">
            {/* Ambient glow behind mockup */}
            <div className="absolute inset-0 bg-slate-100 rounded-[3rem] blur-3xl opacity-50"></div>
            
            <div className={`p-2 transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-out ${acrylicCard}`}>
              
              {/* Browser Top Bar */}
              <div className="flex gap-2 pb-2 pl-2 pt-2">
                <div className="h-3 w-3 rounded-full bg-slate-200/80 shadow-sm border border-slate-100"></div>
                <div className="h-3 w-3 rounded-full bg-slate-200/80 shadow-sm border border-slate-100"></div>
                <div className="h-3 w-3 rounded-full bg-slate-200/80 shadow-sm border border-slate-100"></div>
              </div>
              {/* The Actual Video */}
              <div className="relative rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-inner">
                <video 
                  autoPlay 
                  muted={true} 
                  loop 
                  playsInline
                  preload="auto"
                  className="w-full bg-white/20"
                >
                  <source src="/Adv_p2p_1.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS (Bento Grid) ── */}
      <section className="py-8 md:py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">How it works</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium">Three simple steps — from setup to your first scheduled post, wrapped in clear acrylic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 1: Connect */}
            <div className={`${acrylicCard} p-6 flex flex-col group hover:-translate-y-2 transition-all duration-500`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-200/30 rounded-full blur-2xl group-hover:bg-sky-300/40 transition-colors"></div>
              
              <div className="text-slate-800 font-extrabold text-2xl mb-2">1. Connect</div>
              <p className="text-base text-slate-500 mb-8 font-medium">Link your pages in seconds.</p>
              
              <div className="mt-auto relative bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-5 shadow-sm">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><IgIcon /></div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 delay-75"><FbIcon /></div>
                 </div>
                 <button className={`px-5 py-2.5 text-sm w-full ${primaryButton}`}>Connect Accounts</button>
              </div>
            </div>

            {/* Box 2: Write */}
            <div className={`${acrylicCard} p-6 flex flex-col group hover:-translate-y-2 transition-all duration-500 delay-100`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-200/30 rounded-full blur-2xl group-hover:bg-teal-300/40 transition-colors"></div>

              <div className="text-slate-800 font-extrabold text-2xl mb-2">2. Write</div>
              <p className="text-base text-slate-500 mb-8 font-medium">Type once, preview everywhere.</p>
              
              <div className="mt-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="border border-slate-200 rounded-xl p-4 text-sm text-slate-500 mb-4 h-24 bg-white shadow-inner">
                  Excited to share our latest update! <span className="text-xl">✨</span>
                  <span className="animate-pulse text-sky-400">|</span>
                </div>
                <div className="flex justify-between items-center px-1">
                   <div className="flex gap-2">
                     <span className="w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm"></span>
                     <span className="w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm"></span>
                   </div>
                   <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider bg-sky-100/50 px-2 py-1 rounded-md">Tomorrow 9AM</div>
                </div>
              </div>
            </div>

            {/* Box 3: Done */}
            <div className={`${acrylicCard} p-6 flex flex-col group hover:-translate-y-2 transition-all duration-500 delay-200`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl group-hover:bg-emerald-300/40 transition-colors"></div>

              <div className="text-slate-800 font-extrabold text-2xl mb-2">3. Done</div>
              <p className="text-base text-slate-500 mb-8 font-medium">Your post goes live automatically.</p>
              
              <div className="mt-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
                   <Send size={24} className="ml-1" />
                 </div>
                 <div className="text-base font-bold text-slate-800">Ready for Launch</div>
                 <div className="text-sm text-teal-600 mt-1 font-medium bg-teal-50 px-3 py-1 rounded-full">3 platforms synced</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-8 md:py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">Simple pricing</h2>
            <p className="text-slate-500 text-lg font-medium">Start free. Upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto mt-8">

            {/* Free */}
            <div className={`${acrylicCard} p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300`}>
              <div className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-4 bg-sky-50 inline-block px-3 py-1 rounded-full self-start">Beta Access</div>
              <div className="text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Free</div>
              <p className="text-base text-slate-500 mb-8 font-medium">Try it out during the beta.</p>

              <ul className="space-y-5 mb-10 flex-1">
                {[
                  'Up to 3 social accounts',
                  '5 posts a week',
                  'Free sign up',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-sky-600" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className={`flex items-center justify-center gap-2 px-5 py-3.5 text-base ${acrylicButton}`}>
                Get started free
              </Link>
            </div>

            {/* Yearly — Pro Card */}
            <div className={`${acrylicCard} p-8 flex flex-col relative md:scale-105 shadow-lg z-10 border-sky-100 bg-white !overflow-visible`}>
              {/* Highlight border top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-sky-400 rounded-t-[2rem]"></div>

              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-sky-500 shadow-sm uppercase tracking-widest">
                Most popular
              </div>
              
              <div className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4 bg-teal-50 inline-block px-3 py-1 rounded-full self-start relative z-10">Pro — Yearly</div>
              <div className="flex items-baseline gap-1 mb-2 relative z-10">
                <span className="text-5xl font-extrabold text-slate-800 tracking-tight">$30</span>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ year</span>
              </div>
              <p className="text-base text-slate-500 mb-8 font-medium relative z-10">Best value for serious creators.</p>

              <ul className="space-y-5 mb-10 flex-1 relative z-10">
                {[
                  'Up to 10 social accounts',
                  'Unlimited posts',
                  'Priority email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-800 font-bold">
                    <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Plus size={14} className="text-white" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:airdriveteam@outlook.com?subject=Pro Plan"
                className={`flex items-center justify-center gap-2 px-5 py-3.5 text-base relative z-10 ${primaryButton}`}>
                <Mail size={18} />
                Email to upgrade
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-8 md:py-12 relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "What is Post 2 Post?", a: "Post 2 Post is a lite social media manager tool that allows you to easily schedule and cross-post content, mainly focusing on Facebook and Instagram feed and story." },
              { q: "Is the beta program free?", a: "We are a tester program now, open to 50 testers for now. When we hit the quota, we will upgrade to a new domain website and a better domain." },
              { q: "Which platforms are supported?", a: "Currently, we mainly focus on Facebook and Instagram." },
              { q: "Is there a limit on how many posts I can schedule?", a: "We give 5 posts a week that can be posted to either Facebook or Instagram." },
              { q: "How can I upgrade to a Pro account?", a: "If you feel like upgrading to a pro account, please email us at airdriveteam@outlook.com." }
            ].map((faq, i) => (
              <div key={i} className={`${acrylicCard} p-6`}>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{faq.q}</h3>
                <p className="text-slate-500 font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-6 md:py-8 relative z-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className={`${acrylicCard} p-8 md:p-12`}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-slate-500 mb-8 text-lg font-medium max-w-xl mx-auto">
              Join {testerCount !== null ? testerCount : '...'} creators already in the beta.
              {spotsLeft !== null && ` Only ${spotsLeft} spots left.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup"
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-base ${primaryButton}`}>
                Sign up for free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 pb-12 pt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg object-contain shadow-sm border border-slate-100" />
              <span className="font-bold text-slate-800 tracking-tight text-base">Post 2 Post</span>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-sky-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-sky-600 transition-colors">Terms</Link>
              <a href="mailto:airdriveteam@outlook.com" className="hover:text-sky-600 transition-colors">Contact</a>
            </div>
            <p className="md:ml-auto">© 2026 Post 2 Post.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

