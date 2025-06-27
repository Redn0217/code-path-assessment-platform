import { Question } from '@/components/EnhancedAssessmentView';

export interface QuestionCategory {
  type: 'mcq' | 'coding' | 'scenario';
  label: string;
  icon: string;
  color: string;
  questions: Question[];
}

export interface CategoryProgress {
  type: 'mcq' | 'coding' | 'scenario';
  total: number;
  answered: number;
  percentage: number;
}

export interface AssessmentProgress {
  overall: {
    total: number;
    answered: number;
    percentage: number;
  };
  categories: CategoryProgress[];
}

/**
 * Categorizes questions by their type
 */
export function categorizeQuestions(questions: Question[]): QuestionCategory[] {
  const mcqQuestions = questions.filter(q => q.question_type === 'mcq');
  const codingQuestions = questions.filter(q => q.question_type === 'coding');
  const scenarioQuestions = questions.filter(q => q.question_type === 'scenario');

  const categories: QuestionCategory[] = [];

  if (mcqQuestions.length > 0) {
    categories.push({
      type: 'mcq',
      label: 'Multiple Choice',
      icon: 'FileText',
      color: 'bg-blue-500',
      questions: mcqQuestions
    });
  }

  if (codingQuestions.length > 0) {
    categories.push({
      type: 'coding',
      label: 'Coding Challenges',
      icon: 'Code',
      color: 'bg-green-500',
      questions: codingQuestions
    });
  }

  if (scenarioQuestions.length > 0) {
    categories.push({
      type: 'scenario',
      label: 'Scenarios',
      icon: 'Users',
      color: 'bg-purple-500',
      questions: scenarioQuestions
    });
  }

  return categories;
}

/**
 * Calculates progress for the entire assessment and each category
 */
export function calculateAssessmentProgress(
  questions: Question[], 
  answers: Record<string, any>
): AssessmentProgress {
  const categories = categorizeQuestions(questions);
  
  const categoryProgress: CategoryProgress[] = categories.map(category => {
    const answeredCount = category.questions.filter(q => 
      answers[q.id] !== undefined && 
      answers[q.id] !== null && 
      answers[q.id] !== ''
    ).length;
    
    return {
      type: category.type,
      total: category.questions.length,
      answered: answeredCount,
      percentage: category.questions.length > 0 ? (answeredCount / category.questions.length) * 100 : 0
    };
  });

  const totalQuestions = questions.length;
  const totalAnswered = questions.filter(q => 
    answers[q.id] !== undefined && 
    answers[q.id] !== null && 
    answers[q.id] !== ''
  ).length;

  return {
    overall: {
      total: totalQuestions,
      answered: totalAnswered,
      percentage: totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0
    },
    categories: categoryProgress
  };
}

/**
 * Gets the next question in the assessment flow
 */
export function getNextQuestion(
  currentCategory: 'mcq' | 'coding' | 'scenario',
  currentIndex: number,
  categories: QuestionCategory[]
): { category: 'mcq' | 'coding' | 'scenario'; index: number } | null {
  const currentCategoryData = categories.find(cat => cat.type === currentCategory);
  if (!currentCategoryData) return null;

  // Check if there's a next question in the current category
  if (currentIndex < currentCategoryData.questions.length - 1) {
    return { category: currentCategory, index: currentIndex + 1 };
  }

  // Find the next category with questions
  const currentCategoryIndex = categories.findIndex(cat => cat.type === currentCategory);
  for (let i = currentCategoryIndex + 1; i < categories.length; i++) {
    if (categories[i].questions.length > 0) {
      return { category: categories[i].type, index: 0 };
    }
  }

  return null; // No more questions
}

/**
 * Gets the previous question in the assessment flow
 */
export function getPreviousQuestion(
  currentCategory: 'mcq' | 'coding' | 'scenario',
  currentIndex: number,
  categories: QuestionCategory[]
): { category: 'mcq' | 'coding' | 'scenario'; index: number } | null {
  // Check if there's a previous question in the current category
  if (currentIndex > 0) {
    return { category: currentCategory, index: currentIndex - 1 };
  }

  // Find the previous category with questions
  const currentCategoryIndex = categories.findIndex(cat => cat.type === currentCategory);
  for (let i = currentCategoryIndex - 1; i >= 0; i--) {
    if (categories[i].questions.length > 0) {
      return { 
        category: categories[i].type, 
        index: categories[i].questions.length - 1 
      };
    }
  }

  return null; // No previous questions
}

/**
 * Validates if an answer is considered complete
 */
export function isAnswerComplete(answer: any, questionType: 'mcq' | 'coding' | 'scenario'): boolean {
  if (answer === undefined || answer === null) return false;
  
  if (questionType === 'coding') {
    return typeof answer === 'string' && answer.trim().length > 0;
  }
  
  if (questionType === 'mcq' || questionType === 'scenario') {
    return typeof answer === 'string' && answer.length > 0;
  }
  
  return false;
}

/**
 * Gets assessment completion status
 */
export function getAssessmentCompletionStatus(
  questions: Question[], 
  answers: Record<string, any>
): {
  isComplete: boolean;
  completionPercentage: number;
  incompleteQuestions: Question[];
  incompleteByCategory: Record<string, number>;
} {
  const incompleteQuestions = questions.filter(q => 
    !isAnswerComplete(answers[q.id], q.question_type)
  );
  
  const incompleteByCategory = incompleteQuestions.reduce((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const completionPercentage = questions.length > 0 
    ? ((questions.length - incompleteQuestions.length) / questions.length) * 100 
    : 0;
  
  return {
    isComplete: incompleteQuestions.length === 0,
    completionPercentage,
    incompleteQuestions,
    incompleteByCategory
  };
}

/**
 * Formats time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Gets question difficulty color class
 */
export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Gets question type display information
 */
export function getQuestionTypeInfo(type: 'mcq' | 'coding' | 'scenario'): {
  label: string;
  icon: string;
  color: string;
} {
  switch (type) {
    case 'mcq':
      return {
        label: 'Multiple Choice',
        icon: 'FileText',
        color: 'bg-blue-100 text-blue-800'
      };
    case 'coding':
      return {
        label: 'Coding Challenge',
        icon: 'Code',
        color: 'bg-green-100 text-green-800'
      };
    case 'scenario':
      return {
        label: 'Scenario-Based',
        icon: 'Users',
        color: 'bg-purple-100 text-purple-800'
      };
    default:
      return {
        label: 'Unknown',
        icon: 'FileText',
        color: 'bg-gray-100 text-gray-800'
      };
  }
}
