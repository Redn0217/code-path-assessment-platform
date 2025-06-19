# Question Bank Architecture

## 🎯 Overview

This document describes the new question bank architecture that separates question storage from module assignments, ensuring questions are preserved when removed from modules.

## 🏗️ Architecture Design

### Core Concept
- **Central Question Bank**: All questions stored in `question_bank` table
- **Module Assignments**: `questions` table references question bank for assignments
- **Independent Existence**: Questions survive module removal

### Database Tables

#### `question_bank` (New)
Central repository of all available questions:
```sql
CREATE TABLE question_bank (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq', 'coding', 'scenario')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  domain TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  code_template TEXT,
  test_cases JSONB,
  time_limit INTEGER DEFAULT 300,
  memory_limit INTEGER DEFAULT 128,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### `questions` (Modified)
Module assignments referencing question bank:
```sql
-- Now contains:
- id (assignment ID)
- module_id (which module)
- question_bank_id (which question from bank)
- created_at (when assigned)
- created_by (who assigned)
```

#### `mastery_assessment_questions` (Unchanged)
Remains separate for mastery assessments.

## 🔄 Data Flow

### Creating Questions
1. **Question Bank**: Question created in `question_bank`
2. **Assignment**: If for a module, create assignment in `questions`
3. **Result**: Question exists independently, can be assigned to modules

### Removing from Module
1. **Assignment Deletion**: Remove from `questions` table
2. **Question Preservation**: Question remains in `question_bank`
3. **Result**: Question available for reassignment

### Deleting from Question Bank
1. **Complete Removal**: Delete from `question_bank`
2. **Cascade Effect**: All assignments automatically removed
3. **Result**: Question completely removed from system

## 📊 Benefits

### 1. Question Preservation
- Questions survive module removal
- No accidental data loss
- Central repository for all questions

### 2. Flexible Assignment
- Questions can be assigned to multiple modules
- Easy reassignment between modules
- Clear separation of concerns

### 3. Better Management
- Question Bank shows all available questions
- Module view shows only assigned questions
- Easy to see unassigned questions

### 4. Future-Ready
- Supports multiple assignments per question
- Easy to add question sharing features
- Scalable architecture

## 🔧 Implementation Details

### Application Code Changes

#### QuestionManager
- Queries `questions` with `question_bank` join
- Delete removes assignment, not question
- Shows question bank content in module context

#### QuestionForm
- Creates questions in `question_bank`
- Creates assignments in `questions` if module selected
- Updates question bank content for edits

#### QuestionBank
- Queries `question_bank` directly
- Shows assignment status for each question
- Delete removes from question bank (permanent)

### API Queries

#### Get Module Questions
```typescript
const { data } = await supabase
  .from('questions')
  .select(`
    id,
    module_id,
    question_bank!inner(*)
  `)
  .eq('module_id', moduleId);
```

#### Get All Questions in Bank
```typescript
const { data } = await supabase
  .from('question_bank')
  .select(`
    *,
    questions(module_id, modules(name))
  `)
  .eq('is_active', true);
```

#### Assign Question to Module
```typescript
await supabase
  .from('questions')
  .insert({
    module_id: moduleId,
    question_bank_id: questionId
  });
```

## 🧪 Testing

### Migration Verification
1. Run migration script
2. Execute test script
3. Verify all tests pass
4. Check data integrity

### Application Testing
1. **Module Management**: Remove questions, verify they remain in bank
2. **Question Bank**: Create questions, assign to modules
3. **Question Creation**: Create new questions for modules
4. **Question Editing**: Edit questions, verify updates

## 🚀 Usage Examples

### Admin Workflow
1. **Create Question**: Add to question bank
2. **Assign to Module**: Select from question bank
3. **Remove from Module**: Question stays in bank
4. **Reassign**: Use existing question in different module

### Question Lifecycle
1. **Creation**: Question → Question Bank
2. **Assignment**: Question Bank → Module Assignment
3. **Removal**: Module Assignment deleted, Question Bank preserved
4. **Deletion**: Question Bank → Complete removal

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Separate question bank table
- ✅ Module assignments reference bank
- ✅ Question preservation on removal

### Phase 2 (Future)
- Multiple module assignments per question
- Question sharing between domains
- Bulk assignment operations

### Phase 3 (Future)
- Question versioning
- Question templates
- Advanced filtering and search

## 🔍 Monitoring

### Key Metrics
- Total questions in bank
- Assignment ratio (assigned vs unassigned)
- Question usage across modules
- Orphaned questions

### Health Checks
- Foreign key integrity
- Orphaned assignments
- Inactive questions cleanup
- Performance monitoring

This architecture provides a solid foundation for scalable question management while ensuring data preservation and flexibility.
