'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase-browser';

type SocialAccount = {
  id: string;
  platform: 'instagram' | 'facebook_page';
  account_name: string;
  profile_picture_url: string | null;
  created_at: string;
};

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, profile_picture_url, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAccounts(data as SocialAccount[]);
    }
    setLoading(false);
  };

  const handleDisconnect = async (id: string) => {
    const supabase = createClient();
    await supabase.from('social_accounts').delete().eq('id', id);
    fetchAccounts();
  };

  const handleManualConnect = async () => {
    if (!manualToken.trim()) return;
    setManualLoading(true);
    setManualError('');
    setManualSuccess('');

    try {
      const res = await fetch('/api/admin/connect-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: manualToken.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setManualError(data.error || 'Failed to connect');
      } else {
        setManualSuccess(`Connected: ${data.saved.join(', ')}`);
        setManualToken('');
        setShowManual(false);
        fetchAccounts();
      }
    } catch {
      setManualError('Network error');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-2">Manage your connected social accounts and billing.</p>
          </div>

          {/* Social Accounts Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
                <p className="text-gray-500 text-sm mt-1">Connect your Instagram and Facebook Pages to start scheduling.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManual(!showManual)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
                >
                  🔑 Manual Token
                </button>
                <a
                  href="/api/auth/meta"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  + Connect Meta Accounts
                </a>
              </div>
            </div>

            {/* Manual Token Entry */}
            {showManual && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <h3 className="font-medium text-amber-900">Manual Token Entry</h3>
                <p className="text-sm text-amber-700">
                  Paste your Facebook Page Access Token from the{' '}
                  <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline font-medium">
                    Graph API Explorer
                  </a>. Make sure to select your Page and enable <code className="bg-amber-100 px-1 rounded">pages_show_list</code>,{' '}
                  <code className="bg-amber-100 px-1 rounded">instagram_basic</code>, and{' '}
                  <code className="bg-amber-100 px-1 rounded">instagram_content_publish</code>.
                </p>
                <textarea
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste your access token here..."
                  className="w-full p-3 border border-amber-300 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={3}
                />
                {manualError && <p className="text-red-600 text-sm">❌ {manualError}</p>}
                {manualSuccess && <p className="text-green-600 text-sm">✅ {manualSuccess}</p>}
                <button
                  onClick={handleManualConnect}
                  disabled={manualLoading || !manualToken.trim()}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {manualLoading ? 'Connecting...' : 'Connect with Token'}
                </button>
              </div>
            )}

            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <span className="text-4xl mb-4 block">🔌</span>
                <h3 className="text-lg font-medium text-gray-900">No accounts connected</h3>
                <p className="text-gray-500 mt-1">Click the button above to connect your first account.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      {acc.profile_picture_url ? (
                        <img src={acc.profile_picture_url} alt={acc.account_name} className="w-12 h-12 rounded-full border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                          {acc.account_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{acc.account_name}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 uppercase tracking-wide">
                          {acc.platform.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

