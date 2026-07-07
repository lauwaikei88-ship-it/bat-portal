-- Enable Row Level Security (RLS) on the tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- Policies for 'posts' table
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- -------------------------------------------------------------
-- Policies for 'social_accounts' table
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_accounts;
CREATE POLICY "Users can view their own social accounts" 
ON public.social_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own social accounts" ON public.social_accounts;
CREATE POLICY "Users can insert their own social accounts" 
ON public.social_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_accounts;
CREATE POLICY "Users can update their own social accounts" 
ON public.social_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_accounts;
CREATE POLICY "Users can delete their own social accounts" 
ON public.social_accounts 
FOR DELETE 
USING (auth.uid() = user_id);
