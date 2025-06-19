# Question Bank Edit Button Fix

## 🚨 Problem Identified

When clicking the edit button in the Question Bank, the question details were not being properly mapped to the QuestionForm, resulting in empty or incorrect field values.

## 🔍 Root Cause Analysis

### **Potential Issues Identified**

1. **React Key Problem**: The QuestionForm component was using a simple key that might not change between different questions
2. **Data Structure Differences**: Practice questions vs Mastery questions have different data structures
3. **Field Mapping Issues**: Some fields might not exist or be structured differently between sources
4. **Form State Management**: The form might not be properly resetting/updating when new question data is passed

### **Data Structure Differences**

#### Practice Questions (from question_bank)
```typescript
{
  id: "uuid",
  title: "Question Title",
  question_text: "Question content",
  question_type: "mcq",
  difficulty: "beginner",
  domain: "python",
  options: ["A", "B", "C", "D"], // Array
  correct_answer: "A",
  // ... other fields
  source: "practice"
}
```

#### Mastery Questions (from mastery_assessment_questions)
```typescript
{
  id: "uuid", 
  title: "Question Title",
  question_text: "Question content",
  question_type: "mcq",
  difficulty: "beginner", 
  domain: "python",
  options: ["A", "B", "C", "D"], // Array or JSON string
  correct_answer: "A",
  mastery_assessment_id: "uuid",
  // ... other fields
  source: "mastery"
}
```

## 🔧 Solution Implemented

### **1. Enhanced React Key Strategy**
Updated the QuestionForm key to be more specific and ensure proper re-rendering:

```typescript
// BEFORE (Problematic)
key={editingQuestion?.id || 'new-question'}

// AFTER (Fixed)
key={editingQuestion ? `edit-${editingQuestion.source}-${editingQuestion.id}` : 'new-question'}
```

**Benefits**:
- ✅ Unique key for each question source and ID combination
- ✅ Forces React to completely re-mount component when switching questions
- ✅ Ensures form state is properly reset between different questions

### **2. Improved Field Mapping**
Enhanced the `handleEditQuestion` function with better field mapping:

```typescript
const mappedQuestion = {
  id: question.id,
  title: question.title || '',
  question_text: question.question_text || '',
  question_type: question.question_type || 'mcq',
  difficulty: question.difficulty || 'beginner',
  domain: question.domain || question.domain_name || '',
  module_id: question.module_id || null,
  correct_answer: question.correct_answer || '',
  explanation: question.explanation || '',
  code_template: question.code_template || '',
  time_limit: question.time_limit || 300,
  memory_limit: question.memory_limit || 128,
  source: question.source,
  mastery_assessment_id: question.mastery_assessment_id,
  
  // NEW: Added question_bank_id for proper editing
  question_bank_id: question.question_bank_id || null,
  
  // Robust handling of complex fields...
};
```

### **3. Enhanced Debugging**
Added comprehensive logging to track data flow:

```typescript
console.log('=== EDIT QUESTION DEBUG ===');
console.log('Original question:', question);
console.log('Question source:', question.source);
console.log('Question type:', question.question_type);
console.log('Question options:', question.options);
console.log('Question test_cases:', question.test_cases);
console.log('Question tags:', question.tags);
// ... mapping logic ...
console.log('=== MAPPED QUESTION ===');
console.log('Mapped question:', mappedQuestion);
console.log('========================');
```

## 🧪 Testing Instructions

### **Step 1: Test Practice Questions**
1. Go to Question Bank
2. Filter by "Practice Hub" source
3. Click edit button on any question
4. **Expected**: Form should populate with all question details
5. **Check**: Title, content, type, difficulty, options (for MCQ), etc.

### **Step 2: Test Mastery Questions**
1. Go to Question Bank  
2. Filter by "Mastery Assessments" source
3. Click edit button on any question
4. **Expected**: Form should populate with all question details
5. **Check**: Title, content, type, difficulty, options (for MCQ), etc.

### **Step 3: Test Different Question Types**
1. Test editing MCQ questions → Check options array
2. Test editing Coding questions → Check code template and test cases
3. Test editing Scenario questions → Check all fields

### **Step 4: Check Console Logs**
1. Open browser developer tools
2. Click edit on any question
3. **Expected**: See detailed debug logs showing:
   - Original question data
   - Mapped question data
   - All field values

### **Step 5: Verify Form Behavior**
1. Edit a question and make changes
2. Save the question
3. **Expected**: Changes should be saved correctly
4. **Check**: Question list updates with new values

## 🔍 Debugging Guide

### **If Edit Still Doesn't Work**

#### Check Console Logs
Look for these debug messages:
```
=== EDIT QUESTION DEBUG ===
Original question: {...}
Question source: practice/mastery
=== MAPPED QUESTION ===
Mapped question: {...}
========================
```

#### Common Issues to Check
1. **Missing Fields**: Check if original question has all expected fields
2. **Data Types**: Verify options/test_cases are arrays, not strings
3. **Source Mismatch**: Ensure source field is correctly set
4. **Form State**: Check if useQuestionFormData is processing the mapped question

#### Manual Testing
```javascript
// In browser console, test the mapping logic
const testQuestion = {
  id: "test",
  title: "Test Question", 
  question_text: "Test content",
  question_type: "mcq",
  options: ["A", "B", "C", "D"],
  source: "practice"
};

// Should populate form correctly
```

## 📋 Files Modified

### **Core Changes**
- **`QuestionBank.tsx`**: 
  - Enhanced React key strategy
  - Improved field mapping in `handleEditQuestion`
  - Added comprehensive debugging
  - Added `question_bank_id` field mapping

### **Expected Behavior**
- ✅ **Practice Questions**: Edit button populates form with question bank data
- ✅ **Mastery Questions**: Edit button populates form with mastery assessment data  
- ✅ **All Question Types**: MCQ, Coding, and Scenario questions edit correctly
- ✅ **Complex Fields**: Options, test cases, and tags are properly handled
- ✅ **Form Reset**: Switching between questions properly resets form state

## 🚀 Result

The Question Bank edit functionality should now work correctly for both practice and mastery questions, with proper field mapping and form state management! 🎉

## 🔮 Next Steps

If issues persist:
1. **Check Console Logs**: Use the enhanced debugging to identify specific issues
2. **Test Data Structure**: Verify the actual data structure from your database
3. **Form Component**: Check if `useQuestionFormData` hook is working correctly
4. **Database Fields**: Ensure all expected fields exist in both tables
