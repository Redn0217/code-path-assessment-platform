
-- Create a separate table for mastery assessment questions
CREATE TABLE public.mastery_assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mastery_assessment_id UUID NOT NULL REFERENCES public.mastery_assessments(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  question_type public.question_type NOT NULL,
  difficulty public.difficulty_level NOT NULL,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB, -- For MCQ options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  code_template TEXT, -- For coding questions
  test_cases JSONB, -- For coding questions
  time_limit INTEGER DEFAULT 300, -- in seconds
  memory_limit INTEGER DEFAULT 128, -- in MB
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE public.mastery_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for mastery assessment questions
CREATE POLICY "Anyone can view mastery assessment questions" 
  ON public.mastery_assessment_questions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage mastery assessment questions" 
  ON public.mastery_assessment_questions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_mastery_assessment_questions_assessment_id ON public.mastery_assessment_questions(mastery_assessment_id);
CREATE INDEX idx_mastery_assessment_questions_domain ON public.mastery_assessment_questions(domain);
CREATE INDEX idx_mastery_assessment_questions_type ON public.mastery_assessment_questions(question_type);
CREATE INDEX idx_mastery_assessment_questions_difficulty ON public.mastery_assessment_questions(difficulty);
