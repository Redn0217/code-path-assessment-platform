
-- Create mastery_assessments table for one-time assessments
CREATE TABLE public.mastery_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  domains JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of domain IDs included in this assessment
  total_questions INTEGER NOT NULL DEFAULT 50,
  time_limit_minutes INTEGER NOT NULL DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user_mastery_attempts table to track one-time attempts
CREATE TABLE public.user_mastery_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  mastery_assessment_id UUID NOT NULL REFERENCES public.mastery_assessments(id),
  score INTEGER,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken INTEGER, -- in seconds
  UNIQUE(user_id, mastery_assessment_id) -- Ensures one attempt per user per assessment
);

-- Enable RLS on both tables
ALTER TABLE public.mastery_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mastery_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for mastery_assessments
CREATE POLICY "Anyone can view active mastery assessments" 
  ON public.mastery_assessments 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage mastery assessments" 
  ON public.mastery_assessments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Policies for user_mastery_attempts
CREATE POLICY "Users can view their own mastery attempts" 
  ON public.user_mastery_attempts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mastery attempts" 
  ON public.user_mastery_attempts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery attempts" 
  ON public.user_mastery_attempts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mastery attempts" 
  ON public.user_mastery_attempts 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_mastery_assessments_active ON public.mastery_assessments(is_active);
CREATE INDEX idx_user_mastery_attempts_user_id ON public.user_mastery_attempts(user_id);
CREATE INDEX idx_user_mastery_attempts_assessment_id ON public.user_mastery_attempts(mastery_assessment_id);

-- Insert sample mastery assessments
INSERT INTO public.mastery_assessments (title, description, difficulty, domains, total_questions, time_limit_minutes, order_index) VALUES
('Full Stack Developer Assessment', 'Comprehensive assessment covering Python, DevOps, and Cloud Computing', 'intermediate', '["python", "devops", "cloud"]'::jsonb, 75, 120, 1),
('Data Professional Certification', 'Complete evaluation for Data Science, AI/ML, and Data Security', 'advanced', '["data-science", "ai-ml", "data-security"]'::jsonb, 60, 90, 2),
('Infrastructure Specialist Exam', 'Assessment for Linux, Networking, Storage, and Virtualization skills', 'intermediate', '["linux", "networking", "storage", "virtualization"]'::jsonb, 80, 100, 3);
