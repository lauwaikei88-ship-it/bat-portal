'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import CreatePostModal from '@/components/CreatePostModal';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <WeeklyCalendar posts={posts} onNewPost={() => setIsModalOpen(true)} />
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={fetchPosts} 
      />
    </div>
  );
}
