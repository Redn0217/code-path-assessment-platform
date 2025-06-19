# Architecture Note: Questions Table Structure

## 🚨 Current Issue

The current `questions` table structure still contains all the question content fields (title, question_text, etc.) with NOT NULL constraints, even though we've implemented a question bank architecture where this content should come from the `question_bank` table.

## 🏗️ Current Structure

### `questions` table (assignments)
- Contains: module_id, question_bank_id
- **Also contains**: title, question_text, question_type, difficulty, domain, etc. (duplicated from question_bank)
- **Problem**: All content fields are required (NOT NULL)

### `question_bank` table (content)
- Contains: title, question_text, question_type, difficulty, domain, etc.
- **Purpose**: Central repository for question content

## 🔧 Current Workaround

To make the system work with the current schema, we're copying all question content from `question_bank` to `questions` when creating assignments:

```typescript
// When assigning questions to modules
const assignments = questionBankData.map(qb => ({
  module_id: selectedModule.id,
  question_bank_id: qb.id,
  // Copy ALL content fields from question bank
  title: qb.title,
  question_text: qb.question_text,
  question_type: qb.question_type,
  difficulty: qb.difficulty,
  domain: qb.domain,
  options: qb.options,
  correct_answer: qb.correct_answer,
  explanation: qb.explanation,
  code_template: qb.code_template,
  test_cases: qb.test_cases,
  time_limit: qb.time_limit,
  memory_limit: qb.memory_limit,
  tags: qb.tags
}));
```

## 🎯 Ideal Architecture

The `questions` table should only contain assignment information:

```sql
-- Ideal questions table structure
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id),
  question_bank_id UUID REFERENCES question_bank(id),
  created_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);
```

## 🔄 Migration Needed

To achieve the ideal architecture, we need a migration that:

1. **Removes content columns** from `questions` table
2. **Keeps only assignment columns**: id, module_id, question_bank_id, created_at, created_by
3. **Updates all queries** to join with question_bank for content

## 📋 Migration Steps (Future)

```sql
-- 1. Remove content columns from questions table
ALTER TABLE questions 
DROP COLUMN title,
DROP COLUMN question_text,
DROP COLUMN question_type,
DROP COLUMN difficulty,
DROP COLUMN domain,
DROP COLUMN options,
DROP COLUMN correct_answer,
DROP COLUMN explanation,
DROP COLUMN code_template,
DROP COLUMN test_cases,
DROP COLUMN time_limit,
DROP COLUMN memory_limit,
DROP COLUMN tags,
DROP COLUMN updated_at;

-- 2. Add created_by if not exists
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
```

## 🔍 Impact Analysis

### Current Workaround Impact
- ✅ **Works**: System functions correctly
- ❌ **Data Duplication**: Question content stored in both tables
- ❌ **Sync Issues**: Content can become out of sync
- ❌ **Storage Waste**: Unnecessary data duplication

### After Migration Impact
- ✅ **Clean Architecture**: Single source of truth for question content
- ✅ **No Duplication**: Content only in question_bank
- ✅ **Automatic Sync**: Updates to question_bank reflect everywhere
- ✅ **Efficient Storage**: Minimal data in questions table

## 🚀 Recommendation

1. **Short Term**: Continue with current workaround (already implemented)
2. **Medium Term**: Plan migration to clean up questions table structure
3. **Long Term**: Consider this for future schema designs

## 📝 Code Locations Affected

### Files with workaround:
- `QuestionBankSelector.tsx` - Assignment creation
- `QuestionForm.tsx` - New question assignment
- `QuestionManager.tsx` - Question queries (already using joins)

### Files that would need updates after migration:
- All components querying questions table
- TypeScript types in `types.ts`
- Any direct SQL queries

## 🎯 Benefits of Future Migration

1. **Data Integrity**: Single source of truth
2. **Performance**: Smaller questions table, faster queries
3. **Maintainability**: Cleaner architecture
4. **Scalability**: Better for large question banks
5. **Consistency**: Updates automatically propagate

This architectural improvement would make the system more robust and maintainable in the long run.
