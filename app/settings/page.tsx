'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';
import { User, CreditCard, Link2, Shield, Key, Plus, ExternalLink, Zap, LogOut, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type SocialAccount = {
  id: string;
  platform: 'instagram' | 'facebook_page';
  account_name: string;
  profile_picture_url: string | null;
  created_at: string;
};

type Tab = 'profile' | 'billing' | 'accounts' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('accounts');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

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
                      {/* Decorative elements */}
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                    <div className="text-center py-12 bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500">Profile management coming soon.</p>
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

