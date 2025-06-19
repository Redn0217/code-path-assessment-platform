-- Fix foreign key constraints to allow CASCADE DELETE
-- When a module is deleted, all related data should also be deleted

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
-- Note: assessments table might reference modules, let's make it CASCADE too
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

-- Add comments to explain the cascade behavior
COMMENT ON CONSTRAINT assessment_configs_module_id_fkey ON assessment_configs
IS 'Foreign key to modules table with CASCADE DELETE - when module is deleted, assessment config is also deleted';

COMMENT ON CONSTRAINT questions_module_id_fkey ON questions
IS 'Foreign key to modules table with CASCADE DELETE - when module is deleted, all questions are also deleted';

-- Add comment for assessments if the constraint was created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints
               WHERE constraint_name = 'assessments_module_id_fkey') THEN
        COMMENT ON CONSTRAINT assessments_module_id_fkey ON assessments
        IS 'Foreign key to modules table with CASCADE DELETE - when module is deleted, all assessments are also deleted';
    END IF;
END $$;
