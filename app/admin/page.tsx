'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Crown, UserCheck, BarChart3,
  Search, RefreshCw, LogOut, ChevronUp, ChevronDown,
  Zap, Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  plan: 'free' | 'pro';
  account_count: number;
  post_count: number;
  created_at: string;
};

type SortKey = 'created_at' | 'email' | 'plan' | 'account_count' | 'post_count';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setUsers(data.users);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAdminEmail(user?.email ?? '');
    });
    fetchUsers();
  }, [fetchUsers]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const togglePlan = async (user: UserRow) => {
    const newPlan = user.plan === 'free' ? 'pro' : 'free';
    setToggling(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, plan: newPlan } : u))
        );
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Network error');
    }
    setToggling(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = users
    .filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.plan === 'pro').length;
  const freeUsers = users.filter((u) => u.plan === 'free').length;
  const totalPosts = users.reduce((sum, u) => sum + u.post_count, 0);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1 opacity-20" />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Master Control</h1>
              <p className="text-[11px] text-gray-500">Admin Panel · Post2Post</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:block">{adminEmail}</span>
            <button
              onClick={() => fetchUsers()}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: totalUsers, icon: Users, color: 'from-blue-500 to-blue-700' },
            { label: 'Pro Users', value: proUsers, icon: Crown, color: 'from-amber-500 to-orange-600' },
            { label: 'Free Users', value: freeUsers, icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
            { label: 'Total Posts', value: totalPosts, icon: BarChart3, color: 'from-violet-500 to-purple-700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-semibold text-white">All Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
                    {[
                      { label: 'User', key: 'email' as SortKey },
                      { label: 'Plan', key: 'plan' as SortKey },
                      { label: 'Accounts', key: 'account_count' as SortKey },
                      { label: 'Posts', key: 'post_count' as SortKey },
                      { label: 'Joined', key: 'created_at' as SortKey },
                      { label: 'Action', key: null },
                    ].map(({ label, key }) => (
                      <th
                        key={label}
                        className={`px-6 py-3 text-left font-medium ${key ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                        onClick={() => key && handleSort(key)}
                      >
                        {label}
                        {key && <SortIcon col={key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-600">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/40 transition-colors group">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(user.display_name || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{user.display_name || '—'}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Plan badge */}
                        <td className="px-6 py-4">
                          {user.plan === 'pro' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              <Crown className="w-3 h-3" />
                              Pro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-400 border border-gray-700">
                              <UserCheck className="w-3 h-3" />
                              Free
                            </span>
                          )}
                        </td>

                        {/* Accounts */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{user.account_count}</span>
                            <span className="text-gray-600 text-xs">
                              / {user.plan === 'pro' ? 10 : 3}
                            </span>
                            <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${user.account_count >= (user.plan === 'pro' ? 10 : 3) ? 'bg-red-500' : user.plan === 'pro' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (user.account_count / (user.plan === 'pro' ? 10 : 3)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Posts */}
                        <td className="px-6 py-4 text-gray-300 font-medium">{user.post_count}</td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>

                        {/* Toggle action */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePlan(user)}
                            disabled={toggling === user.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              user.plan === 'free'
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                          >
                            {toggling === user.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : user.plan === 'free' ? (
                              <><Zap className="w-3 h-3" /> Upgrade to Pro</>
                            ) : (
                              <><UserCheck className="w-3 h-3" /> Downgrade to Free</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="px-6 py-3 border-t border-gray-800 text-xs text-gray-600">
              {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
