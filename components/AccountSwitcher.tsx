'use client';

import { useAccounts } from '@/lib/account-context';
import { useState } from 'react';

export default function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccount, loading } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <div className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="p-3 bg-gray-100 rounded-xl text-sm text-gray-500 text-center">
        No accounts connected
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {activeAccount?.profile_picture_url ? (
            <img src={activeAccount.profile_picture_url} alt="" className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              {activeAccount?.account_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-left truncate">
            <p className="text-sm font-semibold text-gray-900 truncate">{activeAccount?.account_name}</p>
            <p className="text-xs text-gray-500 capitalize">{activeAccount?.platform.replace('_', ' ')}</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto py-1">
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => {
                  setActiveAccount(acc);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${activeAccount?.id === acc.id ? 'bg-blue-50' : ''}`}
              >
                {acc.profile_picture_url ? (
                  <img src={acc.profile_picture_url} alt="" className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">
                    {acc.account_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <p className={`text-sm font-medium truncate ${activeAccount?.id === acc.id ? 'text-blue-700' : 'text-gray-900'}`}>{acc.account_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{acc.platform.replace('_', ' ')}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
