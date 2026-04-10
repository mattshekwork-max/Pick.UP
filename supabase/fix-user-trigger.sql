-- ============================================
-- FIX: User Creation Trigger & Missing Users
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. First, create the trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, new.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix existing users who are missing from public.users table
INSERT INTO public.users (id, email, created_at)
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;

-- 5. Verify the fix
SELECT 
  'auth.users count' as table_name, 
  count(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'public.users count', 
  count(*) 
FROM public.users;

-- 6. Check for any auth users missing from public.users
SELECT 
  au.id as auth_user_id,
  au.email,
  u.id as public_user_id
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;
