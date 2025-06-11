
-- Add admin policy for assessments table to allow admins to view all assessments
CREATE POLICY "Admin users can view all assessments" 
  ON public.assessments 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Ensure the existing policy for users to view their own assessments still works
-- (This policy should already exist, but let's make sure)
CREATE POLICY "Users can view their own assessments" 
  ON public.assessments 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);
