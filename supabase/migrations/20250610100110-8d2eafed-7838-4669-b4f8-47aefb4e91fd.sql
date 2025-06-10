
-- First, drop the existing problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a security definer function to safely check admin status
-- This function runs with elevated privileges and avoids RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid
  );
$$;

-- Create new RLS policies that don't cause recursion
CREATE POLICY "Users can view admin status" ON public.admin_users
  FOR SELECT 
  USING (true); -- Allow reading to check admin status

-- Only allow admins to insert/update/delete admin records
CREATE POLICY "Admins can manage admin users" ON public.admin_users
  FOR ALL 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
