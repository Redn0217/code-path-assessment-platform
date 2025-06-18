-- Fix foreign key constraint to allow cascade delete for mastery assessments
-- This migration fixes the issue where mastery assessments cannot be deleted 
-- due to foreign key constraints from user_mastery_attempts table

-- First, drop the existing foreign key constraint
ALTER TABLE public.user_mastery_attempts 
DROP CONSTRAINT user_mastery_attempts_mastery_assessment_id_fkey;

-- Recreate the foreign key constraint with CASCADE DELETE
ALTER TABLE public.user_mastery_attempts 
ADD CONSTRAINT user_mastery_attempts_mastery_assessment_id_fkey 
FOREIGN KEY (mastery_assessment_id) 
REFERENCES public.mastery_assessments(id) 
ON DELETE CASCADE;

-- Add a comment to document this change
COMMENT ON CONSTRAINT user_mastery_attempts_mastery_assessment_id_fkey 
ON public.user_mastery_attempts 
IS 'Foreign key with cascade delete - when a mastery assessment is deleted, all related user attempts are also deleted';
