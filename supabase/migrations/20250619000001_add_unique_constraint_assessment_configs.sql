-- Add unique constraint to ensure only one assessment config per module
-- This prevents duplicate configurations for the same module

-- First, remove any duplicate configurations (keep the most recent one)
WITH duplicates AS (
  SELECT 
    id,
    module_id,
    ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY created_at DESC) as rn
  FROM assessment_configs
)
DELETE FROM assessment_configs 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint on module_id
ALTER TABLE assessment_configs 
ADD CONSTRAINT unique_assessment_config_per_module 
UNIQUE (module_id);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT unique_assessment_config_per_module ON assessment_configs 
IS 'Ensures each module has only one assessment configuration';
