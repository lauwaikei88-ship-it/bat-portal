'use client';
import React from 'react';
import { LayoutDashboard, Settings, LogOut, Send, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const BLUE = "#1d6bf3";
const SKY = "#0ea5e9";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { id: "/dashboard", label: "Composer", icon: LayoutDashboard },
    { id: "/calendar", label: "Calendar", icon: Calendar },
    { id: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 z-10 shadow-sm h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
            <span className="text-white text-xl font-black">2</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 tracking-tight">Post 2 Post</p>
            <p className="text-[10px] text-slate-400 font-mono">v1.0 · Free Plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">Navigation</p>
        {navItems.map((item) => {
          const active = pathname === item.id;
          return (
            <Link
              href={item.id}
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-medium text-sm ${
                active
                  ? "bg-blue-50/80 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.icon size={18} className={active ? "text-blue-600" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
