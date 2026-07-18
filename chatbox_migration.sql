-- =============================================================
-- chatbox_migration.sql
-- Run this in Supabase Dashboard -> SQL Editor
-- =============================================================

-- 1. Create inbox_messages table
CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        TEXT NOT NULL,
  from_id         TEXT NOT NULL,
  from_name       TEXT,
  message_body    TEXT NOT NULL,
  direction       TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  account_id      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create bot_settings table
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt   TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for inbox_messages
-- For now, allow anyone to read/insert (or restrict as needed)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.inbox_messages;
CREATE POLICY "Enable read access for all users" ON public.inbox_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.inbox_messages;
CREATE POLICY "Enable insert for all users" ON public.inbox_messages FOR INSERT WITH CHECK (true);

-- 5. Policies for bot_settings
DROP POLICY IF EXISTS "Users can manage own bot settings" ON public.bot_settings;
CREATE POLICY "Users can manage own bot settings" ON public.bot_settings 
  FOR ALL USING (auth.uid() = user_id);
