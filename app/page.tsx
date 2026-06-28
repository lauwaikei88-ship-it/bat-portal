'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/supabase';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-MY', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function tiltStyle(index: number): React.CSSProperties {
  const tilts = [-1.5, 1.0, -0.5, 1.8, -1.0, 0.5];
  return { transform: `rotate(${tilts[index % tilts.length]}deg)` };
}

function StatusStamp({ status }: { status: string }) {
  const labels: Record<string, string> = {
    approved: 'APPROVED', pending: 'PENDING',
    published: 'POSTED', error: 'ERROR', processing: 'POSTING…'
  };
  return <span className={`status-stamp status-${status}`}>{labels[status] ?? status.toUpperCase()}</span>;
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmit] = useState(false);
  const [toasts, setToasts]     = useState<{ id: number; msg: string; error?: boolean }[]>([]);

  // Form state
  const [prompt, setPrompt]         = useState('');
  const [caption, setCaption]       = useState('');
  const [scheduledAt, setScheduled] = useState('');

  const showToast = (msg: string, error = false) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, error }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchPosts = useCallback(async () => {
    const res  = await fetch('/api/posts');
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
    // Auto-refresh every 30 seconds so status changes show up
    const interval = setInterval(fetchPosts, 30_000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  // Default schedule = tomorrow 9am
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    setScheduled(d.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !caption.trim() || !scheduledAt) {
      showToast('⚠️ Please fill in all three fields!', true); return;
    }
    setSubmit(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, caption, scheduled_at: new Date(scheduledAt).toISOString() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setPrompt(''); setCaption('');
      showToast('📌 Post pinned to the board!');
      await fetchPosts();
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
    setSubmit(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this post from the board?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    showToast('🗑️ Post removed.');
    fetchPosts();
  };

  // Alert: no approved posts in next 7 days
  const now      = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const hasUpcoming = posts.some(p => {
    const d = new Date(p.scheduled_at);
    return p.status === 'approved' && d >= now && d <= nextWeek;
  });

  return (
    <>
      {/* ── Header ── */}
      <div className="header">
        <h1>🦇 Bat Portal</h1>
        <p>Your personal Instagram autopilot — powered by Agnes AI</p>
      </div>

      {/* ── Alert ── */}
      {!loading && !hasUpcoming && (
        <div className="alert-banner">
          <span>⚠️</span>
          Nothing approved this week! Add some posts before you forget.
        </div>
      )}

      <div className="board">
        {/* ── LEFT: Schedule Form ── */}
        <div>
          <div className="paper-card form-card">
            <div className="pin" />
            <h2>📌 Pin a New Post</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>✏️ Image Prompt (for Agnes AI)</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Close-up of a hand tapping a smartwatch on a TapPay terminal, warm lighting..."
                />
              </div>
              <div className="form-group">
                <label>💬 Instagram Caption</label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="e.g. Tap, pay, done. 💳✨ #TapPayMY #NFC"
                />
              </div>
              <div className="form-group">
                <label>📅 Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduled(e.target.value)}
                />
              </div>
              <button className="btn-schedule" type="submit" disabled={submitting}>
                {submitting ? '⏳ Saving...' : '📌 Pin to Board'}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Timeline ── */}
        <div className="timeline-section">
          <h2>📋 Pinboard</h2>

          {loading ? (
            <p className="loading">Loading your posts…</p>
          ) : posts.length === 0 ? (
            <div className="timeline">
              <div className="empty-state">
                <p>📭 Nothing pinned yet!<br />Add your first post on the left.</p>
              </div>
            </div>
          ) : (
            <div className="timeline">
              {posts.map((post, i) => (
                <div className="timeline-item" key={post.id}>
                  <div className="timeline-dot" />
                  <div className="polaroid" style={tiltStyle(i)}>
                    <div className="polaroid-tape" />
                    <button className="btn-delete" onClick={() => handleDelete(post.id)} title="Remove">✕</button>

                    <div className="polaroid-img">
                      {post.image_url
                        ? <img src={post.image_url} alt="Generated post" />
                        : <div style={{ padding: '10px', lineHeight: 1.5 }}>
                            🖼️<br />{post.prompt.slice(0, 70)}...
                          </div>
                      }
                    </div>

                    <div className="polaroid-caption">{post.caption}</div>

                    <div className="polaroid-meta">
                      <span className="polaroid-date">📅 {formatDate(post.scheduled_at)}</span>
                      <StatusStamp status={post.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toasts ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.error ? ' error' : ''}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}
