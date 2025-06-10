
-- Create question types enum
CREATE TYPE public.question_type AS ENUM ('mcq', 'coding', 'scenario');

-- Create difficulty levels enum  
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create questions table for the question bank
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'admin',
  permissions TEXT[] DEFAULT '{"questions:create", "questions:read", "questions:update", "questions:delete", "assessments:read"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment configurations table
CREATE TABLE public.assessment_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  mcq_count INTEGER DEFAULT 10,
  coding_count INTEGER DEFAULT 5,
  scenario_count INTEGER DEFAULT 5,
  total_time_minutes INTEGER DEFAULT 60,
  difficulty_distribution JSONB DEFAULT '{"beginner": 40, "intermediate": 40, "advanced": 20}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update assessments table to include more detailed tracking
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS question_ids UUID[];
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS time_taken INTEGER; -- in seconds
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS detailed_results JSONB;

-- Enable RLS on new tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_configs ENABLE ROW LEVEL SECURITY;

-- Questions policies (admins can manage, users can read)
CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read questions" ON public.questions
  FOR SELECT USING (true);

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Assessment configs policies
CREATE POLICY "Admins can manage assessment configs" ON public.assessment_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read assessment configs" ON public.assessment_configs
  FOR SELECT USING (true);

-- Insert sample questions for each domain (starting with a few examples)
INSERT INTO public.questions (domain, question_type, difficulty, title, question_text, options, correct_answer, explanation) VALUES
-- Python MCQ Questions
('python', 'mcq', 'beginner', 'Python Data Types', 'What is the output of: print(type([]))?', 
 '["<class ''list''>", "<class ''array''>", "<class ''tuple''>", "<class ''dict''>"]', 
 '<class ''list''>', 'The type() function returns the class type of the object. [] creates a list object.'),

('python', 'mcq', 'beginner', 'List Methods', 'Which method is used to add an element to a list?', 
 '["add()", "append()", "insert()", "push()"]', 
 'append()', 'The append() method adds a single element to the end of a list.'),

('python', 'mcq', 'intermediate', 'Dictionary Operations', 'What happens when you try to access a key that doesn''t exist in a dictionary?', 
 '["Returns None", "Returns empty string", "Raises KeyError", "Creates the key"]', 
 'Raises KeyError', 'Accessing a non-existent key in a dictionary raises a KeyError exception.'),

-- DevOps MCQ Questions
('devops', 'mcq', 'beginner', 'CI/CD Basics', 'What does CI/CD stand for?', 
 '["Continuous Integration/Continuous Deployment", "Central Integration/Central Deployment", "Code Integration/Code Deployment", "Custom Integration/Custom Deployment"]', 
 'Continuous Integration/Continuous Deployment', 'CI/CD stands for Continuous Integration and Continuous Deployment/Delivery.'),

('devops', 'mcq', 'intermediate', 'Docker Concepts', 'What is the difference between a Docker image and a Docker container?', 
 '["No difference", "Image is running, container is stopped", "Container is running, image is template", "Image is smaller than container"]', 
 'Container is running, image is template', 'A Docker image is a template/blueprint, while a container is a running instance of that image.');

-- Insert default assessment configurations
INSERT INTO public.assessment_configs (domain, mcq_count, coding_count, scenario_count) VALUES
('python', 15, 3, 2),
('devops', 12, 5, 3),
('cloud', 15, 2, 3),
('linux', 10, 5, 5),
('networking', 18, 0, 2),
('storage', 15, 0, 5),
('virtualization', 12, 2, 6),
('object-storage', 10, 3, 7),
('ai-ml', 10, 5, 5);
