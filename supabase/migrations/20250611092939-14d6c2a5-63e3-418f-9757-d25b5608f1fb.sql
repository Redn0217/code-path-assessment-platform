
-- First, let's see what users exist in auth.users but not in profiles
-- This will create profiles for any users who are missing them

INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 
           au.raw_user_meta_data->>'name', 
           split_part(au.email, '@', 1)) as full_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL;
