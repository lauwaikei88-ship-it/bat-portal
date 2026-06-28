-- Run this SQL in your Supabase SQL Editor to create the posts table
-- Go to: https://supabase.com → Your Project → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS posts (
  id          BIGSERIAL PRIMARY KEY,
  prompt      TEXT        NOT NULL,
  caption     TEXT        NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'approved',
  image_url   TEXT,
  ig_post_id  TEXT,
  error_reason TEXT,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the cron job query (approved posts due for posting)
CREATE INDEX IF NOT EXISTS idx_posts_cron
  ON posts (status, scheduled_at)
  WHERE status = 'approved';

-- Enable Row Level Security (keep data private)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for service role (used by cron)
CREATE POLICY "Service role has full access"
  ON posts FOR ALL
  USING (true)
  WITH CHECK (true);
