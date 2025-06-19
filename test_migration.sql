-- Test script to verify the question bank migration works correctly
-- Run this after applying the migration to check the data integrity

-- 1. Check if question_bank table was created
SELECT 'question_bank table exists' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_bank')
            THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL

-- 2. Check question_bank table structure
SELECT 'question_bank table structure' as test_name,
       CASE WHEN (
         SELECT COUNT(*) FROM information_schema.columns
         WHERE table_name = 'question_bank'
         AND column_name IN ('id', 'title', 'question_text', 'question_type', 'difficulty', 'domain')
       ) >= 6 THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL

-- 3. Check if questions table has question_bank_id
SELECT 'questions table has question_bank_id' as test_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'questions' AND column_name = 'question_bank_id'
       ) THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL

-- 4. Check foreign key constraint
SELECT 'question_bank foreign key constraint' as test_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.table_constraints
         WHERE constraint_name = 'questions_question_bank_id_fkey'
       ) THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL

-- 5. Check if the view was created
SELECT 'questions_with_bank view exists' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'questions_with_bank')
            THEN 'PASS' ELSE 'FAIL' END as result
UNION ALL

-- 6. Check RLS is enabled
SELECT 'RLS enabled on question_bank' as test_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relname = 'question_bank'
         AND n.nspname = 'public'
         AND c.relrowsecurity = true
       ) THEN 'PASS' ELSE 'FAIL' END as result;

-- Show data summary
SELECT
  '=== DATA SUMMARY ===' as info,
  '' as value
UNION ALL
SELECT
  'Total questions in bank' as info,
  COUNT(*)::TEXT as value
FROM question_bank
UNION ALL
SELECT
  'Total assigned questions' as info,
  COUNT(*)::TEXT as value
FROM questions
UNION ALL
SELECT
  'Questions with valid bank references' as info,
  COUNT(*)::TEXT as value
FROM questions q
JOIN question_bank qb ON q.question_bank_id = qb.id
UNION ALL
SELECT
  'Unassigned questions in bank' as info,
  COUNT(*)::TEXT as value
FROM question_bank qb
LEFT JOIN questions q ON qb.id = q.question_bank_id
WHERE q.question_bank_id IS NULL;

-- Show sample data
SELECT
  '=== SAMPLE DATA ===' as info,
  '' as question_title,
  '' as module_name,
  '' as domain_name
UNION ALL
SELECT
  'Sample Assigned Questions:' as info,
  qb.title as question_title,
  m.name as module_name,
  d.name as domain_name
FROM questions q
JOIN question_bank qb ON q.question_bank_id = qb.id
LEFT JOIN modules m ON q.module_id = m.id
LEFT JOIN domains d ON m.domain_id = d.id
LIMIT 5;

-- Check for any orphaned data
SELECT
  '=== ORPHANED DATA CHECK ===' as info,
  '' as details
UNION ALL
SELECT
  'Questions with invalid question_bank_id' as info,
  COUNT(*)::TEXT as details
FROM questions q
LEFT JOIN question_bank qb ON q.question_bank_id = qb.id
WHERE qb.id IS NULL
UNION ALL
SELECT
  'Questions with invalid module_id' as info,
  COUNT(*)::TEXT as details
FROM questions q
LEFT JOIN modules m ON q.module_id = m.id
WHERE q.module_id IS NOT NULL AND m.id IS NULL;
