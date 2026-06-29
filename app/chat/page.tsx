'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am Agnes. How can I help you brainstorm social media content today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto p-4">
        <header className="py-4 border-b border-gray-200 mb-4">
          <h1 className="text-2xl font-bold">Bat Chat ✨</h1>
          <p className="text-sm text-gray-500">Brainstorm with Agnes AI</p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((m, i) => (
            <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={"max-w-[75%] p-3 rounded-lg " + (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200')}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-500">
                Agnes is typing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Agnes for a post idea..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
