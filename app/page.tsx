'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import CreatePostModal from '@/components/CreatePostModal';
import { useAccounts } from '@/lib/account-context';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { activeAccount } = useAccounts();

  const fetchPosts = async () => {
    if (!activeAccount) {
      setPosts([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/posts?social_account_id=${activeAccount.id}`);
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeAccount]);

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
