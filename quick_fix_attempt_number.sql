-- Quick fix to add attempt_number column to existing aira_interview_sessions table
-- Run this in your Supabase SQL Editor to fix the immediate error

-- Add attempt_number column with default value
ALTER TABLE public.aira_interview_sessions 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

-- Update existing records to have proper attempt numbers based on creation order
WITH numbered_sessions AS (
    SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as attempt_num
    FROM public.aira_interview_sessions
)
UPDATE public.aira_interview_sessions 
SET attempt_number = numbered_sessions.attempt_num
FROM numbered_sessions 
WHERE public.aira_interview_sessions.id = numbered_sessions.id;
