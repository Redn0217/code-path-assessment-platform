-- Fix the modules table domain constraint issue
-- This migration handles the case where the domain column still exists with NOT NULL constraint

-- First, check if domain_id column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'domain_id') THEN
        ALTER TABLE public.modules ADD COLUMN domain_id UUID;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'modules_domain_id_fkey') THEN
        ALTER TABLE public.modules 
        ADD CONSTRAINT modules_domain_id_fkey 
        FOREIGN KEY (domain_id) REFERENCES public.domains(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing modules to have domain_id if they have domain but no domain_id
UPDATE public.modules 
SET domain_id = (
  SELECT d.id 
  FROM public.domains d 
  WHERE d.domain_key = public.modules.domain
)
WHERE domain IS NOT NULL AND domain_id IS NULL;

-- Drop NOT NULL constraint from domain column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'modules' AND column_name = 'domain' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE public.modules ALTER COLUMN domain DROP NOT NULL;
    END IF;
END $$;

-- Make domain_id NOT NULL if it isn't already
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'modules' AND column_name = 'domain_id' 
               AND is_nullable = 'YES') THEN
        -- First, delete any modules without domain_id (orphaned records)
        DELETE FROM public.modules WHERE domain_id IS NULL;
        -- Then make it NOT NULL
        ALTER TABLE public.modules ALTER COLUMN domain_id SET NOT NULL;
    END IF;
END $$;

-- Finally, drop the old domain column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'modules' AND column_name = 'domain') THEN
        ALTER TABLE public.modules DROP COLUMN domain;
    END IF;
END $$;

-- Add comment to document the change
COMMENT ON COLUMN public.modules.domain_id IS 'Foreign key reference to parent domain (replaces old domain column)';
