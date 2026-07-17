import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function FriendWhatsappDashboard() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If not logged in, redirect them to home
  if (error || !user) {
    redirect('/'); 
  }

  // Fetch messages from database
  const { data: messages } = await supabase
    .from('inbox_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch bot settings (instructions)
  const { data: botSettings } = await supabase
    .from('bot_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const currentPrompt = botSettings?.system_prompt || '';

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bot Inbox & Settings</h1>
            <p className="text-slate-500">Welcome, {user.email}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Active
          </div>
        </header>

        {/* Bot Instructions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
            🤖 Bot Instructions (AI Persona & Rules)
          </div>
          <div className="p-4">
            <form action={async (formData) => {
              'use server';
              const supabaseServer = createClient();
              const prompt = formData.get('system_prompt');
              
              const { data: existing } = await supabaseServer
                .from('bot_settings')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (existing) {
                await supabaseServer
                  .from('bot_settings')
                  .update({ system_prompt: prompt, updated_at: new Date().toISOString() })
                  .eq('id', existing.id);
              } else {
                await supabaseServer
                  .from('bot_settings')
                  .insert([{ user_id: user.id, system_prompt: prompt }]);
              }
            }}>
              <p className="text-sm text-slate-500 mb-3">
                Tell your AI bot how to behave. It will use these rules to answer incoming messages automatically.
              </p>
              <textarea 
                name="system_prompt"
                defaultValue={currentPrompt}
                placeholder="e.g. You are a friendly customer service agent. Shipping takes 3-5 days. No refunds."
                className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="mt-3 flex justify-end">
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Save Instructions
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Inbox Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex justify-between items-center">
            <span>Recent Messages</span>
          </div>
          
          <div className="divide-y divide-slate-100 h-[500px] overflow-y-auto">
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => (
                <div key={msg.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-900">
                      {msg.from_id || msg.from_name || 'Unknown Sender'}
                      <span className="text-xs text-slate-500 ml-2">({msg.platform})</span>
                      {msg.direction === 'out' && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sent</span>}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{msg.message_body}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <p>No messages yet.</p>
                <p className="text-sm mt-2">Waiting for Webhook events...</p>
              </div>
            )}
          </div>
          
          {/* Simple Reply Box (UI Only - needs API integration to actually send) */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form className="flex gap-2" action={async (formData) => {
              'use server';
              // Here you would call Meta's API to send a reply, and then log it to the DB
              console.log('Sending reply:', formData.get('message'));
            }}>
              <input 
                type="text" 
                name="message"
                placeholder="Type a manual reply..." 
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
