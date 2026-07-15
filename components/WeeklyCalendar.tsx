import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import AccountSwitcher from './AccountSwitcher';

interface Post {
  id: number;
  prompt: string | null;
  caption: string;
  scheduled_at: string;
  status: string;
  media_url?: string;
  media_type?: string;
}

interface WeeklyCalendarProps {
  posts: Post[];
  onNewPost: () => void;
}

export default function WeeklyCalendar({ posts, onNewPost }: WeeklyCalendarProps) {
  // Generate 7 days starting from Monday of the current week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getStatusStyles = (status: string) => {
    switch(status.toLowerCase()) {
      case 'published': return 'border-l-green-500 bg-white';
      case 'approved': return 'border-l-blue-500 bg-white';
      case 'error': return 'border-l-red-500 bg-red-50/30';
      default: return 'border-l-gray-400 bg-white';
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 gap-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-gray-800">Planner</h1>
          <div className="w-64">
            <AccountSwitcher />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          <button 
            onClick={onNewPost}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            New Post
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
        <div className="grid grid-cols-7 gap-4 h-full min-h-[600px]">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduled_at), day));

            return (
              <div key={day.toISOString()} className="flex flex-col h-full">
                {/* Day Header */}
                <div className="text-center mb-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-medium w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Day Column */}
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-2 space-y-2 shadow-sm min-h-0 overflow-y-auto">
                  {dayPosts.map(post => {
                    let imgUrls: string[] = [];
                    if (post.media_url) {
                      try {
                        const parsed = JSON.parse(post.media_url);
                        imgUrls = Array.isArray(parsed) ? parsed : [parsed];
                      } catch {
                        imgUrls = [post.media_url];
                      }
                    }
                    const firstMediaUrl = imgUrls[0];
                    
                    return (
                    <div key={post.id} className={`p-3 rounded-xl border border-gray-100 border-l-4 text-sm shadow-sm hover:shadow-md transition-all group ${getStatusStyles(post.status)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-[11px] text-gray-500 uppercase tracking-wider">
                          {format(new Date(post.scheduled_at), 'h:mm a')}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed text-gray-700 mb-2">
                        {post.caption || post.prompt || 'No content'}
                      </p>
                      
                      {/* Media Preview Thumbnail */}
                      {(firstMediaUrl || post.prompt) && (
                         <div className="mt-2 h-24 w-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
                            {firstMediaUrl ? (
                              <>
                                {post.media_type === 'VIDEO' ? (
                                  <video
                                    src={firstMediaUrl}
                                    className="object-cover w-full h-full"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                ) : (
                                  <img src={firstMediaUrl} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                                )}
                                {post.media_type === 'VIDEO' && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                {imgUrls.length > 1 && (
                                  <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">
                                    1/{imgUrls.length}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-3xl opacity-20 group-hover:scale-110 transition-transform">📸</span>
                            )}
                         </div>
                      )}
                    </div>
                  )})}
                  
                  {dayPosts.length === 0 && (
                    <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={onNewPost}
                        className="text-xs font-medium text-gray-400 hover:text-blue-500 flex items-center gap-1"
                      >
                        + Add Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
