-- Quick fix for CASCADE DELETE constraints
-- Run this SQL directly in Supabase Dashboard SQL Editor to fix module deletion issues

-- 1. Fix assessment_configs table
ALTER TABLE assessment_configs 
DROP CONSTRAINT IF EXISTS assessment_configs_module_id_fkey;

ALTER TABLE assessment_configs 
ADD CONSTRAINT assessment_configs_module_id_fkey 
FOREIGN KEY (module_id) 
REFERENCES modules(id) 
ON DELETE CASCADE;

-- 2. Fix questions table
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_module_id_fkey;

ALTER TABLE questions 
ADD CONSTRAINT questions_module_id_fkey 
FOREIGN KEY (module_id) 
REFERENCES modules(id) 
ON DELETE CASCADE;

-- 3. Fix assessments table (if it has module_id)
DO $$
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'assessments_module_id_fkey') THEN
        ALTER TABLE assessments DROP CONSTRAINT assessments_module_id_fkey;
    END IF;
    
    -- Add the constraint with CASCADE DELETE if module_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'assessments' AND column_name = 'module_id') THEN
        ALTER TABLE assessments 
        ADD CONSTRAINT assessments_module_id_fkey 
        FOREIGN KEY (module_id) 
        REFERENCES modules(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the constraints were created correctly
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'modules'
    AND tc.table_name IN ('assessment_configs', 'questions', 'assessments')
ORDER BY tc.table_name, tc.constraint_name;
