
-- First, let's check if there are RLS policies on the profiles table that might be restricting access
-- We need to allow admin users to see all profiles, not just their own

-- Create a policy that allows admin users to view all profiles
CREATE POLICY "Admin users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Also ensure regular users can still view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Enable RLS on profiles table if it's not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
