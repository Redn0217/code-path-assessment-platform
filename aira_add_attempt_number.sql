-- Migration to add attempt_number column to existing aira_interview_sessions table
-- Run this if you already have the aira_interview_sessions table without attempt_number

-- Add attempt_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aira_interview_sessions' 
        AND column_name = 'attempt_number'
    ) THEN
        ALTER TABLE public.aira_interview_sessions 
        ADD COLUMN attempt_number INTEGER NOT NULL DEFAULT 1;
        
        -- Update existing records to have proper attempt numbers
        -- This will assign attempt numbers based on creation order for each user
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
        
        RAISE NOTICE 'Added attempt_number column and updated existing records';
    ELSE
        RAISE NOTICE 'attempt_number column already exists';
    END IF;
END $$;
