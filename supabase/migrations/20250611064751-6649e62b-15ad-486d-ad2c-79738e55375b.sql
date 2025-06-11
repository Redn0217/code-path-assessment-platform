
-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  icon TEXT DEFAULT 'card',
  color TEXT DEFAULT 'bg-blue-500',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add module_id to questions table
ALTER TABLE public.questions ADD COLUMN module_id UUID REFERENCES public.modules(id);

-- Add module_id to assessments table  
ALTER TABLE public.assessments ADD COLUMN module_id UUID;

-- Add module_id to assessment_configs table
ALTER TABLE public.assessment_configs ADD COLUMN module_id UUID REFERENCES public.modules(id);

-- Enable RLS on modules table
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create policies for modules table
CREATE POLICY "Anyone can view active modules" 
  ON public.modules 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage modules" 
  ON public.modules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_modules_domain ON public.modules(domain);
CREATE INDEX idx_modules_active ON public.modules(is_active);
CREATE INDEX idx_questions_module_id ON public.questions(module_id);

-- Insert some sample modules for Python domain
INSERT INTO public.modules (name, description, domain, icon, color, order_index) VALUES
('Python Basics', 'Fundamentals of Python programming', 'python', 'card', 'bg-blue-500', 1),
('Data Structures', 'Lists, dictionaries, sets and tuples', 'python', 'layout-grid', 'bg-green-500', 2),
('Object-Oriented Programming', 'Classes, objects, inheritance', 'python', 'layout-list', 'bg-purple-500', 3),
('File Handling', 'Reading and writing files in Python', 'python', 'edit', 'bg-orange-500', 4);
