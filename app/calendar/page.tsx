'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, Clock, TrendingUp, BarChart2, Zap, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const BLUE = "#1d6bf3";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Inline SVGs for Facebook and Instagram since they aren't in lucide-react
const FacebookIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="url(#ig-grad)">
    <defs>
      <linearGradient id="ig-grad" x1="2%" y1="84.5%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#feda75" />
        <stop offset="25%" stopColor="#fa7e1e" />
        <stop offset="50%" stopColor="#d62976" />
        <stop offset="75%" stopColor="#962fbf" />
        <stop offset="100%" stopColor="#4f5bd5" />
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

interface Post {
  id: string;
  caption: string;
  scheduled_at: string;
  media_url: string;
  post_to_ig: boolean;
  post_to_fb: boolean;
  format_type: string;
  status: 'scheduled' | 'published' | 'failed' | 'error';
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{reach: number, engagementRate: string} | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (e) {
        console.error("Failed to load posts", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    fetchAnalytics();
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete via API');
      }
      setPosts(posts.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post: ' + err.message);
    }
  };

  // Filter for this week's posts
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekPosts = posts.filter(p => {
    const d = new Date(p.scheduled_at);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const getDayName = (dateStr: string) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date(dateStr).getDay()];
  };

  const getDayNumber = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f4fa] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center sticky top-0 bg-[#f0f4fa]/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Scheduled Posts</h1>
            <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </header>

        <div className="px-8 pb-12 max-w-5xl">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Scheduled This Week</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">{thisWeekPosts.length}</span>
                  <span className="text-xs text-slate-400">of 5 free posts</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0 border border-cyan-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Total Reach</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {loadingAnalytics ? '--' : analyticsData?.reach?.toLocaleString() || '0'}
                  </span>
                  <span className="text-xs text-cyan-600 font-medium">Last 28 days</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <BarChart2 size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Engagement Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {loadingAnalytics ? '--' : `${analyticsData?.engagementRate || '0'}%`}
                  </span>
                  <span className="text-xs text-slate-400">Last 28 days</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-[#eaf1ff] border border-blue-200/60 rounded-2xl p-6 mb-6 flex items-center gap-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-2">{thisWeekPosts.length} of 5 free posts used this week</h3>
              <div className="w-full h-1.5 bg-blue-200/50 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${Math.min((thisWeekPosts.length / 5) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-xs text-slate-500">Upgrade for unlimited posts, advanced analytics & more.</p>
            </div>
            <Link href="/tester-program" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm text-center">
              Upgrade to Pro
            </Link>
          </div>

          {/* Weekly Calendar View */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-800">Week of {formatDate(startOfWeek.toISOString())} - {formatDate(endOfWeek.toISOString())}</h3>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {[0,1,2,3,4,5,6].map(offset => {
                const day = new Date(startOfWeek);
                day.setDate(day.getDate() + offset);
                const dayStr = day.toISOString();
                
                // Find posts for this day
                const dayPosts = thisWeekPosts.filter(p => new Date(p.scheduled_at).toDateString() === day.toDateString());
                
                const isToday = day.toDateString() === now.toDateString();

                return (
                  <div key={offset} className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-slate-400 mb-2">{getDayName(dayStr)}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-3 ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'}`}>
                      {getDayNumber(dayStr)}
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      {dayPosts.map((post, i) => {
                        const isIg = post.post_to_ig;
                        const isFb = post.post_to_fb;

                        let imgUrls: string[] = [];
                        try {
                          const parsed = JSON.parse(post.media_url);
                          imgUrls = Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                          imgUrls = [post.media_url];
                        }
                        const imgUrl = imgUrls[0];
                        
                        return (
                          <div key={i} className="flex flex-col w-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative" style={{ borderRadius: '4px' }}>
                             {/* Image Container */}
                             <div className="relative h-20 w-full bg-slate-200">
                               {imgUrl ? (
                                 // eslint-disable-next-line @next/next/no-img-element
                                 <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                                   <Search size={16} />
                                 </div>
                               )}
                               
                               {/* Platform Icon Bubble */}
                               <div className="absolute -bottom-2 left-2 bg-white rounded-full p-0.5 shadow-sm z-10 flex items-center justify-center">
                                 {isIg ? (
                                   <div className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-100">
                                     <InstagramIcon />
                                   </div>
                                 ) : isFb ? (
                                   <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-100">
                                     <FacebookIcon />
                                   </div>
                                 ) : (
                                   <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-white text-[8px]">
                                     X
                                   </div>
                                 )}
                               </div>
                             </div>
                             
                             {/* Content */}
                             <div className="p-2 pt-3 flex flex-col gap-0.5">
                               <div className="flex justify-between items-center mt-1">
                                 <span className="text-[11px] font-bold text-slate-800 truncate pr-1">
                                    {isIg && isFb ? 'IG & FB' : isIg ? 'Instagram' : isFb ? 'Facebook' : 'Post'}
                                 </span>
                                 <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{formatTime(post.scheduled_at)}</span>
                               </div>
                               <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight mb-1">
                                 {post.caption || 'No caption'}
                               </p>
                             </div>
                             
                             {/* Status Bar */}
                             <div className={`w-full py-1 text-center text-[10px] font-bold flex items-center justify-center gap-1 ${
                               post.status === 'published' ? 'bg-[#e5f5eb] text-[#2ba064]' :
                               post.status === 'failed' || post.status === 'error' ? 'bg-[#fee2e2] text-[#ef4444]' :
                               'bg-[#fdf4e1] text-[#b47124]' // pending/scheduled
                             }`}>
                                {post.status === 'published' ? (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-[#2ba064] text-white flex items-center justify-center text-[8px]">✓</div> Published
                                  </>
                                ) : post.status === 'failed' || post.status === 'error' ? (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-[8px]">✕</div> Failed
                                  </>
                                ) : (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-[#b47124] text-white flex items-center justify-center text-[8px]">▲</div> Pending
                                  </>
                                )}
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* All Posts List */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-6">Posts This Week</h3>
            <div className="flex flex-col gap-6">
              {posts.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-400">
                  <p>No posts scheduled this week.</p>
                </div>
              )}
              {loading && (
                 <div className="text-center py-10 text-slate-400">
                  <p>Loading posts...</p>
                 </div>
              )}
              {posts.map(post => {
                let imgUrls: string[] = [];
                try {
                  const parsed = JSON.parse(post.media_url);
                  imgUrls = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                  imgUrls = [post.media_url];
                }
                const imgUrl = imgUrls[0];
                
                return (
                  <div key={post.id} className="flex items-start gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                      {imgUrl ? (
                        imgUrl.toLowerCase().includes('.mp4') || imgUrl.toLowerCase().includes('.mov') ? (
                          <video src={`${imgUrl}#t=0.001`} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img src={imgUrl} alt="Post preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                      {imgUrls.length > 1 && (
                        <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          1/{imgUrls.length}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1 mb-2">{post.caption}</p>
                      <div className="flex items-center gap-3">
                        {post.status === 'published' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">Published</span>
                        )}
                        {post.status === 'scheduled' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-wider">Scheduled</span>
                        )}
                        {(post.status === 'failed' || post.status === 'error') && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Failed</span>
                        )}
                        
                        {post.post_to_ig && (
                          <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 bg-pink-50 text-pink-600`}>
                            <InstagramIcon />
                            <span className="text-[10px] font-semibold">Instagram {post.format_type === 'STORY' ? 'Story' : 'Feed'}</span>
                          </div>
                        )}
                        {post.post_to_fb && (
                          <div className={`px-2 py-0.5 rounded-md flex items-center gap-1.5 bg-blue-50 text-blue-600`}>
                            <FacebookIcon />
                            <span className="text-[10px] font-semibold">Facebook Page</span>
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDate(post.scheduled_at)} · {formatTime(post.scheduled_at)}
                        </span>
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
