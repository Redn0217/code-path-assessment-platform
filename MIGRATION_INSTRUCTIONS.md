# Migration Instructions: Question Bank Architecture

## 🎯 NEW APPROACH: Separate Question Bank Table

Based on your feedback, we've implemented a **much better architecture** with a separate question bank table:

- **`question_bank`**: Central repository of all available questions
- **`questions`**: Module assignments that reference question bank
- **Clean separation**: Questions exist independently of module assignments

## 📁 File Locations

All files are in the correct directory:
- Migration: `code-path-assessment-platform/supabase/migrations/20250619000003_separate_question_module_relationship_fixed.sql`
- Test: `code-path-assessment-platform/test_migration.sql`
- Instructions: `code-path-assessment-platform/MIGRATION_INSTRUCTIONS.md`

## 🏗️ New Architecture

### Before (Problems)
- Questions directly tied to modules
- Deleting from module = deleting from system
- No central question repository

### After (Better)
- **`question_bank`**: All questions stored here
- **`questions`**: Just assignments (module_id + question_bank_id)
- **Independent existence**: Questions survive module removal

## 📋 Step-by-Step Instructions

### Step 1: Backup Your Database
```sql
-- In Supabase Dashboard, go to Settings > Database
-- Create a backup before running any migration
```

### Step 2: Run the Fixed Migration
In Supabase Dashboard SQL Editor, copy and paste the **entire content** of:
```
code-path-assessment-platform/supabase/migrations/20250619000003_separate_question_module_relationship_fixed.sql
```

### Step 3: Verify Migration Success
Run the test script:
```sql
-- Copy and paste the entire content of:
-- code-path-assessment-platform/test_migration.sql
```

You should see:
- ✅ All tests showing "PASS"
- ✅ Data summary showing your questions and relationships
- ✅ Sample relationships displayed
- ✅ No orphaned data

### Step 4: Test Application
1. Start your application: `npm run dev`
2. Go to Admin Panel → Module Management
3. Select a module and go to Questions tab
4. Try removing a question from the module
5. Go to Question Bank and verify the question still exists

## 🎯 Expected Results

After successful migration:

### Database Changes
- ✅ `question_bank` table created (central repository)
- ✅ `questions` table updated to reference question bank
- ✅ Existing questions migrated to question bank
- ✅ Foreign key constraints updated
- ✅ RLS policies enabled
- ✅ Indexes created for performance

### Application Behavior
- ✅ Questions stored centrally in question bank
- ✅ Module assignments reference question bank
- ✅ Removing from module keeps question in bank
- ✅ Question Bank shows all available questions
- ✅ Questions can be assigned to multiple modules (future)

## 🐛 Troubleshooting

### If Migration Still Fails
1. **Check the error message** - it should be different now
2. **Run this diagnostic query first**:
```sql
-- Check current schema
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('questions', 'modules', 'module_questions')
ORDER BY table_name, ordinal_position;
```

3. **Check for existing data**:
```sql
-- Check existing relationships
SELECT COUNT(*) as total_questions FROM questions;
SELECT COUNT(*) as questions_with_modules FROM questions WHERE module_id IS NOT NULL;
```

### Common Issues and Solutions

**Error: "relation 'modules' does not exist"**
- Run the domain/module separation migrations first
- Check if modules table exists: `SELECT * FROM modules LIMIT 1;`

**Error: "constraint already exists"**
- The migration handles this with IF NOT EXISTS checks
- If it still fails, manually drop the constraint first

**No data migrated**
- Check if questions have module_id values: `SELECT module_id FROM questions WHERE module_id IS NOT NULL LIMIT 5;`
- The migration will skip data migration if no module_id column exists

## 🔄 Manual Verification

After migration, verify the changes:

```sql
-- 1. Check junction table
SELECT COUNT(*) FROM module_questions;

-- 2. Check a specific question's assignments
SELECT q.title, m.name as module_name
FROM questions q
JOIN module_questions mq ON q.id = mq.question_id
JOIN modules m ON mq.module_id = m.id
LIMIT 5;

-- 3. Check unassigned questions
SELECT COUNT(*) as unassigned_questions
FROM questions q
LEFT JOIN module_questions mq ON q.id = mq.question_id
WHERE mq.question_id IS NULL;
```

## ✅ Success Indicators

You'll know the migration worked when:
1. **Test script shows all PASS results**
2. **Application loads without errors**
3. **Questions can be removed from modules without deletion**
4. **Question Bank shows all questions**
5. **New questions can be created and assigned**

## 🆘 Emergency Rollback

If something goes wrong:
```sql
-- Emergency rollback (use with caution)
DROP TABLE IF EXISTS public.module_questions CASCADE;
DROP VIEW IF EXISTS public.questions_with_modules;

-- Restore old constraint if needed
ALTER TABLE public.questions 
ADD CONSTRAINT questions_module_id_fkey 
FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
```

## 📞 Next Steps

After successful migration:
1. Test the application thoroughly
2. Verify question management works as expected
3. Check that no data was lost
4. Consider removing the old `module_id` column from questions table (in a future migration)

The migration is now **fixed and ready to run**! 🚀
