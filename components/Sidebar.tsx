import React from 'react';
import { Calendar, Settings, LogOut, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-16 h-screen bg-gray-900 flex flex-col items-center py-6 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
        <span className="text-white text-xl">🦇</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full">
        <div className="p-3 bg-gray-800 rounded-xl text-blue-400 cursor-pointer relative group">
          <Calendar size={22} strokeWidth={2.5} />
          {/* Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Calendar
          </div>
        </div>

        <div className="p-3 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors relative group">
          <Settings size={22} strokeWidth={2} />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Settings
          </div>
        </div>
      </nav>

      {/* User / Bottom */}
      <div className="mt-auto flex flex-col items-center gap-6 w-full">
        <Link href="/chat" className="p-3 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors relative group">
          <MessageSquare size={22} strokeWidth={2} />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Bat Chat
          </div>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=batman" alt="Avatar" />
        </div>
      </div>
    </div>
  );
}
