-- Prevent duplicate questions in question bank
-- This migration adds constraints to prevent duplicate questions based on title and question_text

-- Step 1: Remove any existing duplicates first (keep the oldest one)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Find and remove duplicates, keeping only the oldest record for each title+question_text combination
  WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY title, question_text 
             ORDER BY created_at ASC
           ) as rn
    FROM public.question_bank
  )
  DELETE FROM public.question_bank 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS duplicate_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate questions from question bank', duplicate_count;
END $$;

-- Step 2: Add unique constraint to prevent future duplicates
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_bank_unique_title_text' 
    AND table_name = 'question_bank'
  ) THEN
    ALTER TABLE public.question_bank 
    ADD CONSTRAINT question_bank_unique_title_text 
    UNIQUE (title, question_text);
    
    RAISE NOTICE 'Added unique constraint to prevent duplicate questions';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;

-- Step 3: Create index for better performance on duplicate checks
CREATE INDEX IF NOT EXISTS idx_question_bank_title_text 
ON public.question_bank(title, question_text);

-- Step 4: Add comments
COMMENT ON CONSTRAINT question_bank_unique_title_text ON public.question_bank 
IS 'Prevents duplicate questions with same title and question text';

-- Step 5: Create a function to find similar questions (for future use)
CREATE OR REPLACE FUNCTION find_similar_questions(
  search_title TEXT,
  search_text TEXT,
  similarity_threshold FLOAT DEFAULT 0.8
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  question_text TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qb.id,
    qb.title,
    qb.question_text,
    GREATEST(
      similarity(qb.title, search_title),
      similarity(qb.question_text, search_text)
    ) as similarity_score
  FROM public.question_bank qb
  WHERE 
    similarity(qb.title, search_title) > similarity_threshold
    OR similarity(qb.question_text, search_text) > similarity_threshold
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_similar_questions IS 'Finds questions similar to given title and text using PostgreSQL similarity';

-- Final status
DO $$
DECLARE
  total_questions INTEGER;
  unique_combinations INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_questions FROM public.question_bank;
  SELECT COUNT(DISTINCT (title, question_text)) INTO unique_combinations FROM public.question_bank;
  
  RAISE NOTICE '=== DUPLICATE PREVENTION COMPLETED ===';
  RAISE NOTICE 'Total questions in bank: %', total_questions;
  RAISE NOTICE 'Unique title+text combinations: %', unique_combinations;
  
  IF total_questions = unique_combinations THEN
    RAISE NOTICE 'SUCCESS: No duplicates found';
  ELSE
    RAISE NOTICE 'WARNING: % potential duplicates detected', (total_questions - unique_combinations);
  END IF;
  RAISE NOTICE '=========================================';
END $$;
