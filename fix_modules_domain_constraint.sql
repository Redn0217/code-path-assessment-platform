-- Quick fix for the modules domain constraint issue
-- Run this SQL directly in Supabase Dashboard SQL Editor

-- Step 1: Drop NOT NULL constraint from domain column if it exists
ALTER TABLE public.modules ALTER COLUMN domain DROP NOT NULL;

-- Step 2: Add domain_id column if it doesn't exist
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS domain_id UUID;

-- Step 3: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'modules_domain_id_fkey') THEN
        ALTER TABLE public.modules 
        ADD CONSTRAINT modules_domain_id_fkey 
        FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain_key TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'card',
  color TEXT DEFAULT 'bg-blue-500',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 5: Enable RLS on domains table
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for domains table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active domains') THEN
        CREATE POLICY "Anyone can view active domains" 
          ON public.domains 
          FOR SELECT 
          USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage domains') THEN
        CREATE POLICY "Admins can manage domains" 
          ON public.domains 
          FOR ALL 
          USING (
            EXISTS (
              SELECT 1 FROM public.admin_users 
              WHERE user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Step 7: Insert some default domains if none exist
INSERT INTO public.domains (name, domain_key, icon, color, is_active, order_index)
SELECT 'Python', 'python', 'code', 'bg-blue-500', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.domains WHERE domain_key = 'python');

INSERT INTO public.domains (name, domain_key, icon, color, is_active, order_index)
SELECT 'DevOps', 'devops', 'server', 'bg-green-500', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.domains WHERE domain_key = 'devops');

INSERT INTO public.domains (name, domain_key, icon, color, is_active, order_index)
SELECT 'Cloud', 'cloud', 'cloud', 'bg-purple-500', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.domains WHERE domain_key = 'cloud');

-- Step 8: Update existing modules to have domain_id if they don't
UPDATE public.modules 
SET domain_id = (
  SELECT d.id 
  FROM public.domains d 
  WHERE d.domain_key = public.modules.domain
)
WHERE domain IS NOT NULL AND domain_id IS NULL;

-- Step 9: For any modules without domain_id, assign them to the first available domain
UPDATE public.modules 
SET domain_id = (SELECT id FROM public.domains ORDER BY order_index LIMIT 1)
WHERE domain_id IS NULL;

-- Step 10: Now make domain_id NOT NULL
ALTER TABLE public.modules ALTER COLUMN domain_id SET NOT NULL;

-- Step 11: Drop the old domain column
ALTER TABLE public.modules DROP COLUMN IF EXISTS domain;
