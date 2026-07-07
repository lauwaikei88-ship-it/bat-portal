-- Migration script for Hootsuite UI pivot
ALTER TABLE posts ALTER COLUMN prompt DROP NOT NULL;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_to_ig BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_to_fb BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'IMAGE';

-- (Optional) If you want to support storing the generated text before approving
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

