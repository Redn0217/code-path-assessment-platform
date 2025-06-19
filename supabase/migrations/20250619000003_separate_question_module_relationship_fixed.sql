-- Create separate question bank table for better architecture
-- This migration creates a central question bank and updates the questions table
-- to reference questions from the bank instead of storing them directly

-- Step 1: Create central question bank table
CREATE TABLE IF NOT EXISTS public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'coding', 'scenario')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  domain TEXT NOT NULL, -- General domain (python, devops, etc.)
  options JSONB, -- For MCQ options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  code_template TEXT, -- For coding questions
  test_cases JSONB, -- For coding questions
  time_limit INTEGER DEFAULT 300, -- in seconds
  memory_limit INTEGER DEFAULT 128, -- in MB
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 2: Migrate existing questions to question bank
DO $$
DECLARE
  migration_count INTEGER := 0;
  rec RECORD;
BEGIN
  -- Check if questions table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN

    RAISE NOTICE 'Migrating existing questions to question bank...';

    -- Migrate all existing questions to question bank
    FOR rec IN
      SELECT DISTINCT
        q.id,
        q.title,
        q.question_text,
        q.question_type,
        q.difficulty,
        q.domain,
        q.options,
        q.correct_answer,
        q.explanation,
        q.code_template,
        q.test_cases,
        q.time_limit,
        q.memory_limit,
        q.tags,
        q.created_at,
        q.updated_at
      FROM public.questions q
    LOOP
      -- Insert into question bank (avoid duplicates)
      INSERT INTO public.question_bank (
        id, title, question_text, question_type, difficulty, domain,
        options, correct_answer, explanation, code_template, test_cases,
        time_limit, memory_limit, tags, created_at, updated_at
      )
      VALUES (
        rec.id, rec.title, rec.question_text, rec.question_type, rec.difficulty, rec.domain,
        rec.options, rec.correct_answer, rec.explanation, rec.code_template, rec.test_cases,
        rec.time_limit, rec.memory_limit, rec.tags, rec.created_at, rec.updated_at
      )
      ON CONFLICT (id) DO NOTHING;

      migration_count := migration_count + 1;
    END LOOP;

    RAISE NOTICE 'Migrated % questions to question bank', migration_count;
  ELSE
    RAISE NOTICE 'No questions table found - skipping question bank migration';
  END IF;
END $$;

-- Step 3: Update questions table structure
DO $$
BEGIN
  -- Add question_bank_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'question_bank_id'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN question_bank_id UUID;
    RAISE NOTICE 'Added question_bank_id column to questions table';
  END IF;

  -- Update existing questions to reference question bank
  UPDATE public.questions
  SET question_bank_id = id
  WHERE question_bank_id IS NULL;

  -- Add foreign key constraint to question bank
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_question_bank_id_fkey'
  ) THEN
    ALTER TABLE public.questions
    ADD CONSTRAINT questions_question_bank_id_fkey
    FOREIGN KEY (question_bank_id) REFERENCES public.question_bank(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to question bank';
  END IF;

  -- Make question_bank_id required
  ALTER TABLE public.questions ALTER COLUMN question_bank_id SET NOT NULL;

  RAISE NOTICE 'Updated questions table structure';
END $$;

-- Step 4: Clean up old structure and enable RLS
DO $$
BEGIN
  -- Remove old foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'questions_module_id_fkey'
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions DROP CONSTRAINT questions_module_id_fkey;
    RAISE NOTICE 'Dropped old questions_module_id_fkey constraint';
  END IF;

  -- Remove duplicate columns from questions table (keep only essential fields)
  -- We'll keep the original structure but now questions reference question_bank
  RAISE NOTICE 'Questions table now references question_bank for content';
END $$;

-- Step 5: Enable RLS on question_bank
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Create policies for question_bank
DROP POLICY IF EXISTS "Anyone can view question bank" ON public.question_bank;
DROP POLICY IF EXISTS "Admins can manage question bank" ON public.question_bank;

CREATE POLICY "Anyone can view question bank"
  ON public.question_bank
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage question bank"
  ON public.question_bank
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_bank_domain ON public.question_bank(domain);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON public.question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON public.question_bank(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_question_bank_id ON public.questions(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_module_id ON public.questions(module_id);

-- Step 7: Add documentation
COMMENT ON TABLE public.question_bank IS 'Central repository of all available questions across all domains';
COMMENT ON TABLE public.questions IS 'Module-specific question assignments referencing question bank';
COMMENT ON COLUMN public.questions.question_bank_id IS 'Reference to question in central question bank';

-- Step 8: Create views for easier querying
CREATE OR REPLACE VIEW public.questions_with_bank AS
SELECT
  q.id,
  q.module_id,
  q.created_at as assigned_at,
  -- Question bank content
  qb.title,
  qb.question_text,
  qb.question_type,
  qb.difficulty,
  qb.domain,
  qb.options,
  qb.correct_answer,
  qb.explanation,
  qb.code_template,
  qb.test_cases,
  qb.time_limit,
  qb.memory_limit,
  qb.tags,
  qb.is_active,
  qb.created_by,
  -- Module info
  m.name as module_name,
  m.domain_id,
  d.name as domain_name,
  d.domain_key
FROM public.questions q
JOIN public.question_bank qb ON q.question_bank_id = qb.id
LEFT JOIN public.modules m ON q.module_id = m.id
LEFT JOIN public.domains d ON m.domain_id = d.id;

COMMENT ON VIEW public.questions_with_bank IS 'Complete view of questions with question bank content and module assignments';

-- Final status report
DO $$
DECLARE
  total_bank_questions INTEGER;
  total_assigned_questions INTEGER;
  total_unassigned_bank INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_bank_questions FROM public.question_bank;
  SELECT COUNT(*) INTO total_assigned_questions FROM public.questions;
  SELECT COUNT(*) INTO total_unassigned_bank
  FROM public.question_bank qb
  LEFT JOIN public.questions q ON qb.id = q.question_bank_id
  WHERE q.question_bank_id IS NULL;

  RAISE NOTICE '=== QUESTION BANK MIGRATION COMPLETED ===';
  RAISE NOTICE 'Total questions in bank: %', total_bank_questions;
  RAISE NOTICE 'Total assigned questions: %', total_assigned_questions;
  RAISE NOTICE 'Unassigned questions in bank: %', total_unassigned_bank;
  RAISE NOTICE '========================================';
END $$;
