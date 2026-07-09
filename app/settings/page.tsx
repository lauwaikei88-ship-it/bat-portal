'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { User, CreditCard, Link2, Shield, Plus, ExternalLink, Zap, LogOut, CheckCircle2, XCircle, AlertCircle, RefreshCw, Camera, Lock, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type SocialAccount = {
  id: string;
  platform: 'instagram' | 'facebook_page';
  account_name: string;
  profile_picture_url: string | null;
  created_at: string;
};

type Tab = 'profile' | 'billing' | 'accounts' | 'security';

// ─── Inner component that reads search params (requires Suspense wrapper) ───
function OAuthBanner({ onSuccess }: { onSuccess: () => void }) {
  const searchParams = useSearchParams();
  const oauthSuccess = searchParams.get('success');
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (oauthSuccess === 'accounts_connected') {
      // Re-fetch accounts after a successful OAuth connection
      onSuccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthSuccess]);

  if (!oauthSuccess && !oauthError) return null;

  return (
    <>
      {oauthSuccess === 'accounts_connected' && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-4 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>🎉 Accounts connected successfully! Your social accounts are now ready to use.</span>
        </div>
      )}
      {oauthError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to connect account</p>
            <p className="text-red-600 font-normal mt-0.5">
              {oauthError === 'meta_auth_failed'
                ? 'Meta declined the authorisation request.'
                : oauthError === 'no_pages_found'
                ? 'No Facebook Pages or Instagram Business accounts were found. Make sure you manage at least one Facebook Page linked to an Instagram Business account.'
                : oauthError}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('accounts');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);

  // Profile state
  const [profileUser, setProfileUser] = useState<{ id: string; email: string; display_name: string } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAccounts();
    fetchProfile();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Use the server-side API route to avoid browser client session hydration timing issues.
      // The browser Supabase client may not have the auth cookie available on first mount,
      // causing RLS to return empty even when the user is logged in.
      const res = await fetch('/api/accounts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAccounts(json.accounts ?? []);
    } catch (e) {
      console.error('[Settings] fetchAccounts error:', e);
    }
    setLoading(false);
  };

  const handleDisconnect = async (id: string) => {
    await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
    fetchAccounts();
  };

  // ── Profile helpers ──
  const fetchProfile = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const json = await res.json();
      setProfileUser(json);
      setDisplayName(json.display_name || '');
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameSaved(false);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName.trim() }),
    });
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password: newPassword }),
    });
    const json = await res.json();
    setSavingPassword(false);
    if (res.ok) {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: json.error || 'Failed to update password.' });
    }
  };

  // Initials avatar helper
  const getInitials = (name: string, email: string) => {
    if (name?.trim()) {
      return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return (email?.[0] || 'U').toUpperCase();
  };

  const runDebug = async () => {
    setLoadingDebug(true);
    setDebugInfo(null);
    try {
      const res = await fetch('/api/debug/accounts');
      const data = await res.json();
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setDebugInfo('Failed to fetch debug info: ' + e.message);
    }
    setLoadingDebug(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accounts', label: 'Connected Accounts', icon: Link2 },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'security', label: 'Security & Legal', icon: Shield },
  ] as const;

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden font-sans text-[#0f1419]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* OAuth result banners — wrapped in Suspense because useSearchParams requires it */}
          <Suspense fallback={null}>
            <OAuthBanner onSuccess={fetchAccounts} />
          </Suspense>

          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 text-lg">Manage your account preferences and integrations.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar for tabs */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <nav className="flex flex-col space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-sm border border-gray-100 ring-1 ring-black/[0.02]'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content area */}
            <div className="flex-1">
              
              {/* ACCOUNTS TAB */}
              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Connected Accounts</h2>
                          <p className="text-gray-500 text-sm mt-1">Connect your Instagram and Facebook Pages to enable direct publishing.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={fetchAccounts}
                            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 px-4 rounded-xl transition-all"
                            title="Refresh accounts list"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                          </button>
                          <a
                            href="/api/auth/meta"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-5 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                          >
                            <Plus className="w-4 h-4" />
                            Connect Meta
                          </a>
                        </div>
                      </div>

                      {/* Accounts List */}
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                              <div className="flex items-center gap-4">
                                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                              </div>
                              <div className="h-8 bg-gray-200 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      ) : accounts.length === 0 ? (
                        <div className="text-center py-16 px-6 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                            <Link2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">No accounts connected</h3>
                          <p className="text-gray-500 mt-2 max-w-sm mx-auto">Connect your social media accounts to start scheduling and publishing posts.</p>
                          <a
                            href="/api/auth/meta"
                            className="mt-6 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-5 rounded-xl transition-all shadow-sm border border-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                            Add Account
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {accounts.map((acc) => (
                            <div key={acc.id} className="group relative flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ring-1 ring-black/[0.02]">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  {acc.profile_picture_url ? (
                                    <img src={acc.profile_picture_url} alt={acc.account_name} className="w-12 h-12 rounded-full border border-gray-100 object-cover shadow-sm" />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center text-indigo-600 text-lg font-bold shadow-sm">
                                      {acc.account_name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 truncate max-w-[150px]">{acc.account_name}</h4>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                      acc.platform === 'instagram' 
                                        ? 'bg-pink-50 text-pink-600 border border-pink-100' 
                                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                      {acc.platform.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end">
                                <button
                                  onClick={() => handleDisconnect(acc.id)}
                                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debug panel — helps diagnose DB vs RLS issues */}
                  <div className="bg-gray-900 rounded-2xl p-6 text-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Diagnostic</p>
                      <button
                        onClick={runDebug}
                        disabled={loadingDebug}
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingDebug ? 'animate-spin' : ''}`} />
                        {loadingDebug ? 'Checking…' : 'Check Database'}
                      </button>
                    </div>
                    {debugInfo ? (
                      <pre className="text-green-400 text-xs overflow-auto max-h-96 leading-relaxed">{debugInfo}</pre>
                    ) : (
                      <p className="text-gray-600 text-xs font-mono">Click &quot;Check Database&quot; to see what&apos;s in your social_accounts table and diagnose any issues.</p>
                    )}
                  </div>
                </div>
              )}

              {/* BILLING TAB */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Subscription Plan</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage your billing and upgrade options.</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap className="w-32 h-32" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-6 backdrop-blur-md">
                          Current Plan
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                          <h3 className="text-4xl font-bold">Freemium</h3>
                          <span className="text-gray-400 mb-1">/ $0</span>
                        </div>
                        <p className="text-gray-300 max-w-md mb-8">
                          You are currently on the free plan which allows up to 5 posts per week.
                        </p>
                        
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-200">5 posts per week</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-gray-200">Basic analytics</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400">
                            <XCircle className="w-5 h-5" />
                            <span>Unlimited scheduling</span>
                          </div>
                        </div>

                        <button className="bg-white text-gray-900 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2">
                          <Zap className="w-4 h-4 text-indigo-600" />
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">

                  {/* Avatar & Name Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                    {/* Avatar row */}
                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                        >
                          {profileUser ? getInitials(profileUser.display_name, profileUser.email) : '…'}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                          <Camera className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {profileUser?.display_name || profileUser?.email?.split('@')[0] || '—'}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">{profileUser?.email || '—'}</p>
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                          Free Plan
                        </span>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                          />
                          <button
                            onClick={handleSaveName}
                            disabled={savingName || !displayName.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                          >
                            {nameSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {nameSaved ? 'Saved!' : savingName ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                          <span className="text-sm text-gray-600 flex-1">{profileUser?.email || '—'}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Verified</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Email changes are not supported yet.</p>
                      </div>
                    </div>
                  </div>

                  {/* Change Password Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Change Password</h3>
                        <p className="text-xs text-gray-400">Choose a strong password — at least 8 characters.</p>
                      </div>
                    </div>

                    {passwordMsg && (
                      <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                        passwordMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {passwordMsg.type === 'success'
                          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {passwordMsg.text}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                          />
                          <button onClick={() => setShowPasswords(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your new password"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </div>

                      {/* Strength indicator */}
                      {newPassword.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                newPassword.length >= i * 3
                                  ? newPassword.length >= 12 ? 'bg-emerald-400'
                                    : newPassword.length >= 8 ? 'bg-yellow-400'
                                    : 'bg-red-400'
                                  : 'bg-gray-200'
                              }`} />
                            ))}
                          </div>
                          <p className={`text-[11px] font-medium ${
                            newPassword.length >= 12 ? 'text-emerald-600' : newPassword.length >= 8 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Moderate' : 'Too short'}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleChangePassword}
                        disabled={savingPassword || !newPassword || !confirmPassword}
                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        {savingPassword ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-red-700">Danger Zone</h3>
                        <p className="text-xs text-red-400">These actions are permanent and cannot be undone.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50/60 border border-red-100 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-red-800">Delete Account</p>
                        <p className="text-xs text-red-500 mt-0.5">Permanently delete your account and all data.</p>
                      </div>
                      <Link
                        href="/delete"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Link>
                    </div>
                  </div>

                </div>
              )}

              {/* SECURITY & LEGAL TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Legal & Privacy</h2>
                    <p className="text-gray-500 text-sm mb-6">Review our policies and manage your data.</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href="/privacy" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Privacy Policy</h3>
                          <p className="text-sm text-gray-500 mt-1">Read how we collect and use your data.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </Link>
                      
                      <Link href="/terms" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">Terms of Service</h3>
                          <p className="text-sm text-gray-500 mt-1">Review the rules and guidelines for using our platform.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </Link>
                      
                      <Link href="/delete" className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group mt-4">
                        <div>
                          <h3 className="font-medium text-red-700">Data Deletion</h3>
                          <p className="text-sm text-red-600/80 mt-1">Request to have all your data permanently removed.</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-red-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
