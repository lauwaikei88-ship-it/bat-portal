import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

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

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-xl font-semibold text-gray-800">Planner</h1>
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
                  {dayPosts.map(post => (
                    <div key={post.id} className={`p-3 rounded-lg border text-sm shadow-sm ${getStatusColor(post.status)}`}>
                      <div className="font-semibold mb-1 text-xs opacity-80 uppercase tracking-wide">
                        {format(new Date(post.scheduled_at), 'h:mm a')}
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed font-medium">
                        {post.caption || post.prompt || 'No content'}
                      </p>
                      
                      {/* Optional Media Preview Thumbnail could go here */}
                      {(post.media_url || post.prompt) && (
                         <div className="mt-2 h-20 w-full bg-black/5 rounded flex items-center justify-center overflow-hidden">
                            {post.media_url ? (
                              <img src={post.media_url} className="object-cover w-full h-full opacity-80 mix-blend-multiply" />
                            ) : (
                              <span className="text-3xl opacity-20">📸</span>
                            )}
                         </div>
                      )}
                    </div>
                  ))}
                  
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
