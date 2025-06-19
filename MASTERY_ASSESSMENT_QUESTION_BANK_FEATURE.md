# Mastery Assessment Question Bank Feature

## 🎯 Overview

Extended the "Add from Question Bank" functionality to Mastery Assessment question management, allowing admins to assign existing questions from the central question bank to mastery assessments, complementing the existing "Add Question" functionality.

## ✨ New Features

### 1. **Add from Question Bank Button (Mastery Assessments)**
- Located next to the existing "Add Question" button in Mastery Assessment Management
- Uses Library icon to distinguish from creating new questions
- Opens a comprehensive question selection dialog tailored for mastery assessments

### 2. **MasteryQuestionBankSelector Component**
- **Domain-Aware Filtering**: Filters questions based on assessment domains
- **Search Functionality**: Search questions by title or content
- **Advanced Filtering**: Filter by question type, difficulty level, and domain
- **Smart Exclusion**: Only shows questions not already assigned to the current assessment
- **Bulk Selection**: Select individual questions or use "Select All" option
- **Visual Design**: Consistent with module question bank selector

### 3. **Mastery Assessment Assignment Management**
- **Bulk Assignment**: Assign multiple questions at once to mastery assessments
- **Domain Validation**: Ensures questions match assessment domains
- **Duplicate Prevention**: Prevents assigning the same question twice
- **Real-time Updates**: Immediate feedback and data refresh

## 🏗️ Implementation Details

### Files Created/Modified

#### New Files:
- **`MasteryQuestionBankSelector.tsx`**: Mastery assessment-specific question selector

#### Modified Files:
- **`QuestionActions.tsx`**: Added "Add from Question Bank" button and dialog
- **`MasteryAssessmentQuestionManager.tsx`**: Updated to pass assessment data

### Component Architecture

```
MasteryAssessmentQuestionManager
├── QuestionActions
│   ├── Add New Question (existing)
│   │   └── QuestionForm
│   └── Add from Question Bank (new)
│       └── MasteryQuestionBankSelector
│           ├── Domain-aware Search & Filters
│           ├── Question List
│           └── Assignment Logic
```

### Key Differences from Module Version

#### Data Structure
```typescript
// Module assignments (questions table)
{
  module_id: string,
  question_bank_id: string,
  // + all question content fields
}

// Mastery assessment assignments (mastery_assessment_questions table)
{
  mastery_assessment_id: string,
  // + all question content fields (no question_bank_id reference)
}
```

#### Duplicate Detection
```typescript
// Module version: Uses question_bank_id
const assignedIds = new Set(assignedData?.map(a => a.question_bank_id));

// Mastery version: Uses title + question_text signature
const assignedSignatures = new Set(
  assignedData?.map(a => `${a.title}|||${a.question_text}`)
);
```

#### Domain Filtering
```typescript
// Enhanced domain filtering for mastery assessments
<Select value={selectedDomain} onValueChange={setSelectedDomain}>
  <SelectContent>
    <SelectItem value="all">All Domains</SelectItem>
    {parsedDomains.map(domain => (
      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 🎨 User Experience

### Workflow
1. **Navigate** to Admin Panel → Mastery Assessments → Select Assessment → Manage Questions
2. **Choose Option**:
   - "Add New Question" → Create from scratch
   - "Add from Question Bank" → Select existing questions
3. **Filter by Domain**: Questions automatically filtered by assessment domains
4. **Select Questions** using search, filters, and checkboxes
5. **Assign** selected questions to the mastery assessment
6. **Confirmation** with success message and updated question list

### Visual Design
- **Consistent UI**: Matches module question bank selector design
- **Domain Context**: Shows assessment domains in header
- **Smart Filtering**: Domain filter populated with assessment domains
- **Clear Feedback**: Selection count and assignment status

## 🔧 Technical Implementation

### Data Flow
```typescript
1. Fetch available questions from question_bank
2. Filter by assessment domains (parsedDomains)
3. Exclude already assigned questions (by title + question_text)
4. Apply user filters (search, type, difficulty, domain)
5. Display filtered results with selection UI
6. On assignment: Insert records into mastery_assessment_questions table
7. Refresh all relevant queries
```

### Database Operations
```sql
-- Get available questions for mastery assessment
SELECT * FROM question_bank 
WHERE domain IN ($assessmentDomains)
AND NOT EXISTS (
  SELECT 1 FROM mastery_assessment_questions 
  WHERE mastery_assessment_id = $assessmentId
  AND title = question_bank.title 
  AND question_text = question_bank.question_text
)

-- Assign selected questions
INSERT INTO mastery_assessment_questions (
  mastery_assessment_id, title, question_text, question_type,
  difficulty, domain, options, correct_answer, explanation,
  code_template, test_cases, time_limit, memory_limit, tags
)
VALUES (...)
```

### Query Management
- **Separate Query Keys**: `available-mastery-questions` vs `available-questions`
- **Domain-Aware Caching**: Includes assessment domains in query key
- **Automatic Invalidation**: Updates mastery assessment and question bank queries

## 🎯 Benefits

### For Administrators
- **Efficiency**: Quickly assign existing questions to mastery assessments
- **Domain Alignment**: Questions automatically filtered by assessment domains
- **Quality Assurance**: Reuse well-tested questions across assessments
- **Time Saving**: No need to recreate similar questions for different assessments

### For System Architecture
- **Consistency**: Same question bank serves both modules and assessments
- **Flexibility**: Questions can be used in multiple contexts
- **Maintainability**: Single source of truth for question content
- **Scalability**: Easy to manage large question libraries

## 🧪 Testing Scenarios

### Functional Testing
1. **Basic Assignment**: Select and assign single question to mastery assessment
2. **Bulk Assignment**: Select and assign multiple questions
3. **Domain Filtering**: Verify questions filtered by assessment domains
4. **Search Functionality**: Search by title and content
5. **Type/Difficulty Filtering**: Filter by question type and difficulty
6. **Duplicate Prevention**: Verify no duplicate assignments
7. **Cross-Assessment**: Assign same question to different assessments

### Edge Cases
1. **No Available Questions**: When all questions already assigned
2. **Domain Mismatch**: Questions outside assessment domains
3. **Large Question Sets**: Performance with many questions
4. **Multi-Domain Assessments**: Assessments spanning multiple domains

## 🚀 Usage Instructions

### For Admins
1. Go to **Admin Panel** → **Mastery Assessments**
2. Select an assessment and click **"Manage Questions"**
3. Click **"Add from Question Bank"** (Library icon)
4. Questions are automatically filtered by assessment domains
5. Use additional filters (type, difficulty, domain) as needed
6. Select questions using checkboxes
7. Click **"Assign Selected (X)"** to assign questions
8. Questions will appear in the assessment's question list

### Best Practices
- **Domain Alignment**: Ensure questions match assessment domains
- **Difficulty Balance**: Mix different difficulty levels appropriately
- **Question Types**: Include variety of question types (MCQ, Coding, Scenario)
- **Regular Review**: Periodically review and update question assignments

## 🔮 Future Enhancements

### Phase 1 (Current)
- ✅ Basic question assignment from bank to mastery assessments
- ✅ Domain-aware filtering
- ✅ Bulk selection and assignment

### Phase 2 (Potential)
- Question recommendation based on assessment domains
- Assessment template creation with pre-selected questions
- Question difficulty distribution analysis
- Cross-assessment question usage analytics

### Phase 3 (Advanced)
- AI-powered question suggestions
- Automatic assessment generation
- Question performance analytics
- Advanced question tagging and categorization

This feature significantly enhances the mastery assessment workflow by providing easy access to the central question bank while maintaining domain alignment and preventing duplicates.
