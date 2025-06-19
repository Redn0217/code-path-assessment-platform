-- Create separate domains and modules tables
-- This migration separates domains (parent) from modules (child) for proper hierarchy

-- Create domains table for parent domain entities
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  domain_key TEXT NOT NULL UNIQUE, -- e.g., 'python', 'devops', etc.
  icon TEXT DEFAULT 'card',
  color TEXT DEFAULT 'bg-blue-500',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Migrate existing domain-level entries from modules table to domains table
INSERT INTO public.domains (name, description, domain_key, icon, color, is_active, order_index, created_by)
SELECT DISTINCT 
  name,
  description,
  domain as domain_key,
  icon,
  color,
  is_active,
  order_index,
  created_by
FROM public.modules 
WHERE domain IS NOT NULL
ON CONFLICT (domain_key) DO NOTHING;

-- Add domain_id column to modules table to reference domains
ALTER TABLE public.modules ADD COLUMN domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE;

-- Update existing modules to reference the correct domain
UPDATE public.modules
SET domain_id = (
  SELECT d.id
  FROM public.domains d
  WHERE d.domain_key = public.modules.domain
)
WHERE domain IS NOT NULL;

-- Remove domain-level entries from modules table (keep only actual modules)
-- This assumes that domain-level entries don't have specific module characteristics
-- You may need to adjust this logic based on your data
DELETE FROM public.modules
WHERE domain_id IS NULL AND domain IS NOT NULL;

-- Drop the old domain column NOT NULL constraint first
ALTER TABLE public.modules ALTER COLUMN domain DROP NOT NULL;

-- Make domain_id required for modules
ALTER TABLE public.modules ALTER COLUMN domain_id SET NOT NULL;

-- Now we can safely drop the old domain column
ALTER TABLE public.modules DROP COLUMN IF EXISTS domain;

-- Enable RLS on domains table
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create policies for domains table
CREATE POLICY "Anyone can view active domains" 
  ON public.domains 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage domains" 
  ON public.domains 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_domains_active ON public.domains(is_active);
CREATE INDEX idx_domains_domain_key ON public.domains(domain_key);
CREATE INDEX idx_modules_domain_id ON public.modules(domain_id);

-- Add comment to document the relationship
COMMENT ON TABLE public.domains IS 'Parent domain entities (e.g., Python, DevOps, Cloud)';
COMMENT ON TABLE public.modules IS 'Child modules within domains (e.g., Python Basics, Advanced Python)';
COMMENT ON COLUMN public.modules.domain_id IS 'Foreign key reference to parent domain';
