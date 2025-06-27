import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Code,
  Users,
  Clock,
  CheckCircle,
  Circle,
  XCircle,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedCodeEditor from './EnhancedCodeEditor';
import { 
  categorizeQuestions, 
  calculateAssessmentProgress, 
  getNextQuestion, 
  getPreviousQuestion,
  formatTimeRemaining,
  getDifficultyColor,
  getQuestionTypeInfo,
  getAssessmentCompletionStatus
} from '@/utils/assessmentUtils';

export interface Question {
  id: string;
  title: string;
  question_text: string;
  question_type: 'mcq' | 'coding' | 'scenario';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  code_template?: string;
  test_cases?: any[];
  time_limit?: number;
  memory_limit?: number;
  tags?: string[];
  domain?: string;
}

interface EnhancedQuestionCategory {
  type: 'mcq' | 'coding' | 'scenario';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  questions: Question[];
}

interface EnhancedAssessmentViewProps {
  questions: Question[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: any) => void;
  onSubmit: () => void;
  timeLeft?: number;
  isSubmitting?: boolean;
  title?: string;
  isLoading?: boolean;
}

const EnhancedAssessmentView: React.FC<EnhancedAssessmentViewProps> = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  timeLeft,
  isSubmitting = false,
  title = "Assessment",
  isLoading = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<'mcq' | 'coding' | 'scenario'>('mcq');
  const [isNavPanelOpen, setIsNavPanelOpen] = useState(true);
  const [codeValues, setCodeValues] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any[]>>({});
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close nav panel on mobile
      if (window.innerWidth < 768) {
        setIsNavPanelOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Categorize questions by type
  const questionCategories: EnhancedQuestionCategory[] = useMemo(() => {
    return categorizeQuestions(questions).map(category => ({
      ...category,
      icon: category.type === 'mcq' ? FileText :
            category.type === 'coding' ? Code : Users
    }));
  }, [questions]);

  // Calculate assessment progress
  const assessmentProgress = useMemo(() => {
    return calculateAssessmentProgress(questions, answers);
  }, [questions, answers]);

  // Get current question
  const currentQuestion = useMemo(() => {
    const currentCategoryData = questionCategories.find(cat => cat.type === currentCategory);
    if (!currentCategoryData || currentCategoryData.questions.length === 0) {
      return null;
    }
    return currentCategoryData.questions[currentQuestionIndex] || null;
  }, [questionCategories, currentCategory, currentQuestionIndex]);

  // Initialize with first available category
  useEffect(() => {
    if (questionCategories.length > 0 && !questionCategories.find(cat => cat.type === currentCategory)) {
      setCurrentCategory(questionCategories[0].type);
      setCurrentQuestionIndex(0);
    }
  }, [questionCategories, currentCategory]);

  // Initialize code values for coding questions
  useEffect(() => {
    const codingQuestions = questions.filter(q => q.question_type === 'coding');
    const initialCodeValues: Record<string, string> = {};

    codingQuestions.forEach(question => {
      if (!codeValues[question.id]) {
        initialCodeValues[question.id] = question.code_template || '';
      }
    });

    if (Object.keys(initialCodeValues).length > 0) {
      setCodeValues(prev => ({ ...prev, ...initialCodeValues }));
    }
  }, [questions]);

  // Reset internal submitting state when external isSubmitting changes
  useEffect(() => {
    if (!isSubmitting && isSubmittingInternal) {
      setIsSubmittingInternal(false);
    }
  }, [isSubmitting, isSubmittingInternal]);

  // Handle category change
  const handleCategoryChange = (categoryType: 'mcq' | 'coding' | 'scenario') => {
    setCurrentCategory(categoryType);
    setCurrentQuestionIndex(0);
  };

  // Convert enhanced categories to original format for navigation functions
  const originalCategories = useMemo(() => {
    return questionCategories.map(cat => ({
      type: cat.type,
      label: cat.label,
      icon: cat.type === 'mcq' ? 'FileText' : cat.type === 'coding' ? 'Code' : 'Users',
      color: cat.color,
      questions: cat.questions
    }));
  }, [questionCategories]);

  // Handle question navigation within category
  const handleQuestionNavigation = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const prevQuestion = getPreviousQuestion(currentCategory, currentQuestionIndex, originalCategories);
      if (prevQuestion) {
        setCurrentCategory(prevQuestion.category);
        setCurrentQuestionIndex(prevQuestion.index);
      }
    } else {
      const nextQuestion = getNextQuestion(currentCategory, currentQuestionIndex, originalCategories);
      if (nextQuestion) {
        setCurrentCategory(nextQuestion.category);
        setCurrentQuestionIndex(nextQuestion.index);
      }
    }
  }, [currentCategory, currentQuestionIndex, originalCategories]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't interfere with typing in code editor or input fields
      if (event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLInputElement ||
          (event.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handleQuestionNavigation('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleQuestionNavigation('next');
          break;
        case 'Escape':
          event.preventDefault();
          if (isMobile && isNavPanelOpen) {
            setIsNavPanelOpen(false);
          }
          break;
        case 'm':
        case 'M':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setIsNavPanelOpen(!isNavPanelOpen);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleQuestionNavigation, isNavPanelOpen, isMobile]);

  // Handle direct question selection
  const handleQuestionSelect = useCallback((categoryType: 'mcq' | 'coding' | 'scenario', questionIndex: number) => {
    setCurrentCategory(categoryType);
    setCurrentQuestionIndex(questionIndex);
  }, []);

  // Handle MCQ answer change
  const handleMCQAnswerChange = useCallback((value: string) => {
    if (currentQuestion && currentQuestion.options) {
      // Convert option text to option index for consistent scoring
      const optionIndex = currentQuestion.options.indexOf(value);
      console.log('EnhancedAssessmentView: MCQ answer change:', {
        questionId: currentQuestion.id,
        selectedText: value,
        optionIndex,
        options: currentQuestion.options
      });
      onAnswerChange(currentQuestion.id, optionIndex);
    }
  }, [currentQuestion, onAnswerChange]);

  // Handle code change
  const handleCodeChange = useCallback((code: string) => {
    if (currentQuestion) {
      setCodeValues(prev => ({ ...prev, [currentQuestion.id]: code }));
      onAnswerChange(currentQuestion.id, code);
    }
  }, [currentQuestion, onAnswerChange]);

  // Handle test results
  const handleTestResults = useCallback((results: any[]) => {
    if (currentQuestion) {
      setTestResults(prev => ({ ...prev, [currentQuestion.id]: results }));
    }
  }, [currentQuestion]);

  // Handle submit with confirmation
  const handleSubmitClick = useCallback(() => {
    // Prevent multiple submissions
    if (isSubmitting || isSubmittingInternal) {
      return;
    }

    const completionStatus = getAssessmentCompletionStatus(questions, answers);
    if (!completionStatus.isComplete) {
      setShowSubmitConfirm(true);
    } else {
      setIsSubmittingInternal(true);
      onSubmit();
    }
  }, [questions, answers, isSubmitting, isSubmittingInternal, onSubmit]);

  const confirmSubmit = useCallback(() => {
    // Prevent multiple submissions
    if (isSubmitting || isSubmittingInternal) {
      return;
    }

    setShowSubmitConfirm(false);
    setIsSubmittingInternal(true);
    onSubmit();
  }, [isSubmitting, isSubmittingInternal, onSubmit]);

  // Get category progress from assessment progress
  const getCategoryProgress = (categoryType: 'mcq' | 'coding' | 'scenario') => {
    const categoryProgress = assessmentProgress.categories.find(cat => cat.type === categoryType);
    return categoryProgress ? categoryProgress.percentage : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">No questions available</p>
          <p className="text-gray-400 text-sm">Please check your assessment configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isMobile && isNavPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsNavPanelOpen(false)}
        />
      )}
      
      {/* Navigation Panel */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50",
        isMobile ? (
          isNavPanelOpen 
            ? "fixed left-0 top-0 h-full w-80 shadow-lg" 
            : "fixed left-0 top-0 h-full w-16"
        ) : (
          isNavPanelOpen ? "w-80" : "w-16"
        )
      )}>
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isNavPanelOpen && (
            <div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                {Math.round(assessmentProgress.overall.percentage)}% Complete
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavPanelOpen(!isNavPanelOpen)}
            className="p-2"
            title={isNavPanelOpen ? "Close navigation panel (Ctrl+M)" : "Open navigation panel (Ctrl+M)"}
          >
            {isNavPanelOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Overall Progress */}
        {isNavPanelOpen && (
          <div className="p-4 border-b border-gray-200">
            <Progress value={assessmentProgress.overall.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{assessmentProgress.overall.answered} answered</span>
              <span>{assessmentProgress.overall.total} total</span>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          {questionCategories.map((category) => (
            <div key={category.type} className="border-b border-gray-100">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryChange(category.type)}
                className={cn(
                  "w-full p-4 text-left hover:bg-gray-50 transition-colors",
                  currentCategory === category.type && "bg-blue-50 border-r-2 border-blue-500"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg text-white", category.color)}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  {isNavPanelOpen && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{category.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.questions.length}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <Progress value={getCategoryProgress(category.type)} className="h-1" />
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Question List */}
              {isNavPanelOpen && currentCategory === category.type && (
                <div className="bg-gray-50">
                  {category.questions.map((question, index) => {
                    const answer = answers[question.id];
                    const isAnswered = answer !== undefined && answer !== null && answer !== '';
                    const isCurrent = currentQuestionIndex === index;

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionSelect(category.type, index)}
                        className={cn(
                          "w-full p-3 text-left hover:bg-gray-100 transition-colors border-l-2",
                          isCurrent ? "bg-white border-blue-500" : "border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isAnswered ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Q{index + 1}: {question.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", getDifficultyColor(question.difficulty))}
                              >
                                {question.difficulty}
                              </Badge>
                              {question.time_limit && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {question.time_limit}s
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {isNavPanelOpen && (
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitClick();
              }}
              disabled={isSubmitting || isSubmittingInternal}
              className="w-full"
              size="lg"
            >
              {(isSubmitting || isSubmittingInternal) ? 'Submitting...' : 'Submit Assessment'}
            </Button>

            {/* Submit Confirmation Dialog */}
            {showSubmitConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <h3 className="text-lg font-semibold mb-2">Submit Assessment?</h3>
                  <p className="text-gray-600 mb-4">
                    You have unanswered questions. Are you sure you want to submit your assessment?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowSubmitConfirm(false)}
                      disabled={isSubmitting || isSubmittingInternal}
                      className="flex-1"
                    >
                      Continue Working
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        confirmSubmit();
                      }}
                      disabled={isSubmitting || isSubmittingInternal}
                      className="flex-1"
                    >
                      {(isSubmitting || isSubmittingInternal) ? 'Submitting...' : 'Submit Now'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile && isNavPanelOpen && "opacity-50 pointer-events-none"
      )}>
        {/* Header */}
        <div className={cn(
          "bg-white border-b border-gray-200",
          isMobile ? "p-3" : "p-4"
        )}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col gap-3"
          )}>
            <div className={cn(
              "flex items-center gap-4",
              isMobile && "flex-col gap-2 w-full"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "flex-wrap justify-center"
              )}>
                <Badge variant="outline" className={isMobile ? "text-xs" : ""}>
                  {currentQuestion.question_type === 'mcq' ? 'Multiple Choice' :
                   currentQuestion.question_type === 'coding' ? 'Coding Challenge' : 'Scenario-Based'}
                </Badge>
                <Badge className={cn(
                  getDifficultyColor(currentQuestion.difficulty),
                  isMobile && "text-xs"
                )}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <div className={cn(
                "text-gray-500",
                isMobile ? "text-xs text-center" : "text-sm"
              )}>
                Question {currentQuestionIndex + 1} of {questionCategories.find(cat => cat.type === currentCategory)?.questions.length || 0}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== undefined && (
                <div className={cn(
                  "flex items-center gap-2 text-gray-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeRemaining(timeLeft)}</span>
                </div>
              )}

              {!isMobile && (
                <div className="text-xs text-gray-400" title="Use ← → arrow keys to navigate">
                  ⌨️ ← →
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className={cn(
            "flex items-center justify-between",
            isMobile ? "mt-3 gap-2" : "mt-4"
          )}>
            <Button
              variant="outline"
              onClick={() => handleQuestionNavigation('prev')}
              disabled={!getPreviousQuestion(currentCategory, currentQuestionIndex, originalCategories)}
              className={cn(
                "flex items-center gap-2",
                isMobile && "text-xs px-3 py-2"
              )}
              title="Previous question (←)"
            >
              <ChevronLeft className="h-4 w-4" />
              {!isMobile && "Previous"}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuestionNavigation('next')}
              disabled={!getNextQuestion(currentCategory, currentQuestionIndex, originalCategories)}
              className={cn(
                "flex items-center gap-2",
                isMobile && "text-xs px-3 py-2"
              )}
              title="Next question (→)"
            >
              {!isMobile && "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-hidden">
          {currentQuestion.question_type === 'coding' ? (
            // Split-screen layout for coding questions (responsive)
            <ResizablePanelGroup
              direction={isMobile ? "vertical" : "horizontal"}
              className="h-full"
            >
              <ResizablePanel
                defaultSize={isMobile ? 40 : 50}
                minSize={isMobile ? 25 : 30}
              >
                <div className="h-full flex flex-col bg-white">
                  <Tabs defaultValue="question" className="h-full flex flex-col">
                    <TabsList className={cn(
                      "grid w-full grid-cols-2 m-4 mb-0",
                      isMobile && "mx-2 my-2"
                    )}>
                      <TabsTrigger value="question">Question</TabsTrigger>
                      <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                    </TabsList>

                    <TabsContent value="question" className={cn(
                      "flex-1 overflow-y-auto",
                      isMobile ? "p-2" : "p-4"
                    )}>
                      <div className="space-y-4">
                        <h3 className={cn(
                          "font-semibold",
                          isMobile ? "text-base" : "text-lg"
                        )}>
                          {currentQuestion.title}
                        </h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-gray-700">
                            {currentQuestion.question_text}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="testcases" className={cn(
                      "flex-1 overflow-y-auto",
                      isMobile ? "p-2" : "p-4"
                    )}>
                      <div className="space-y-4">
                        {/* Test Results Section */}
                        {testResults[currentQuestion.id] && testResults[currentQuestion.id].length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              Test Results
                              <Badge variant="outline" className="text-xs">
                                {testResults[currentQuestion.id].filter(r => r.passed).length}/{testResults[currentQuestion.id].length} Passed
                              </Badge>
                            </h4>
                            <div className="space-y-3">
                              {testResults[currentQuestion.id].map((result: any, index: number) => {
                                const isFirstTestCase = result.testCase === 1;

                                return (
                                  <Card key={index} className={cn(
                                    "p-3",
                                    result.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                                  )}>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                          Test Case {result.testCase}
                                          {isFirstTestCase && (
                                            <Badge variant="outline" className="text-xs">
                                              Sample
                                            </Badge>
                                          )}
                                          {result.passed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                          )}
                                        </div>
                                        <Badge variant={result.passed ? "default" : "destructive"} className="text-xs">
                                          {result.passed ? 'PASSED' : 'FAILED'}
                                        </Badge>
                                      </div>

                                      {result.description && (
                                        <p className="text-xs text-gray-600">{result.description}</p>
                                      )}

                                      {/* Show detailed results only for first test case (sample) */}
                                      {isFirstTestCase ? (
                                        <div className="grid grid-cols-1 gap-2 text-xs">
                                          <div>
                                            <span className="font-medium text-gray-700">Input:</span>
                                            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto border">
                                              {result.input || 'No input'}
                                            </pre>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Expected:</span>
                                            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto border">
                                              {result.expected}
                                            </pre>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Actual:</span>
                                            <pre className={cn(
                                              "p-2 rounded mt-1 overflow-x-auto border",
                                              result.passed ? "bg-white" : "bg-red-100"
                                            )}>
                                              {result.actual}
                                            </pre>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className={cn(
                                          "text-xs italic p-2 rounded border",
                                          result.passed
                                            ? "text-green-700 bg-green-50 border-green-200"
                                            : "text-red-700 bg-red-50 border-red-200"
                                        )}>
                                          {result.passed
                                            ? "✅ Hidden test case passed - Details not shown"
                                            : "❌ Hidden test case failed - Details not shown"
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Original Test Cases Section */}
                        <div>
                          <h4 className="font-semibold">Test Cases</h4>
                          {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 ? (
                            <div className="space-y-3 mt-3">
                              {currentQuestion.test_cases.map((testCase: any, index: number) => {
                                const isFirstTestCase = index === 0;
                                const testResult = testResults[currentQuestion.id]?.find(r => r.testCase === index + 1);

                                return (
                                  <Card key={index} className={cn(
                                    "p-3",
                                    testResult && (testResult.passed ? "border-green-200" : "border-red-200")
                                  )}>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                          Test Case {index + 1}
                                          {isFirstTestCase && (
                                            <Badge variant="outline" className="text-xs">
                                              Sample
                                            </Badge>
                                          )}
                                          {testResult && (
                                            testResult.passed ? (
                                              <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-600" />
                                            )
                                          )}
                                        </div>
                                        {testResult && (
                                          <Badge variant={testResult.passed ? "default" : "destructive"} className="text-xs">
                                            {testResult.passed ? 'PASSED' : 'FAILED'}
                                          </Badge>
                                        )}
                                      </div>

                                      {testCase.description && (
                                        <div>
                                          <div className="text-xs text-gray-500 mb-1">Description:</div>
                                          <p className="text-xs text-gray-700">{testCase.description}</p>
                                        </div>
                                      )}

                                      {/* Show details only for first test case (sample) */}
                                      {isFirstTestCase && (
                                        <>
                                          {testCase.input && (
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Input:</div>
                                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                {testCase.input}
                                              </pre>
                                            </div>
                                          )}
                                          {testCase.expected_output && (
                                            <div>
                                              <div className="text-xs text-gray-500 mb-1">Expected Output:</div>
                                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                {testCase.expected_output}
                                              </pre>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* Hidden test case message */}
                                      {!isFirstTestCase && (
                                        <div className={cn(
                                          "text-xs italic p-2 rounded",
                                          testResult
                                            ? testResult.passed
                                              ? "text-green-700 bg-green-50 border border-green-200"
                                              : "text-red-700 bg-red-50 border border-red-200"
                                            : "text-gray-500 bg-gray-50"
                                        )}>
                                          {testResult
                                            ? testResult.passed
                                              ? "🔒✅ Hidden test case - Passed"
                                              : "🔒❌ Hidden test case - Failed"
                                            : "🔒 Hidden test case - Input and expected output are not shown"
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-3">No test cases available</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                defaultSize={isMobile ? 60 : 50}
                minSize={isMobile ? 40 : 30}
              >
                <div className="h-full bg-white">
                  <EnhancedCodeEditor
                    language={currentQuestion.domain === 'python' ? 'python' :
                             currentQuestion.domain === 'linux' ? 'bash' : 'javascript'}
                    value={codeValues[currentQuestion.id] || currentQuestion.code_template || ''}
                    onChange={handleCodeChange}
                    testCases={currentQuestion.test_cases}
                    timeLimit={currentQuestion.time_limit}
                    memoryLimit={currentQuestion.memory_limit}
                    onTestResults={handleTestResults}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            // Regular layout for MCQ and scenario questions
            <div className={cn(
              "h-full overflow-y-auto",
              isMobile ? "p-4" : "p-6"
            )}>
              <Card className={cn(
                "mx-auto",
                isMobile ? "max-w-full" : "max-w-4xl"
              )}>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={cn(
                    isMobile ? "text-lg" : "text-xl"
                  )}>
                    {currentQuestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  "space-y-6",
                  isMobile && "p-4"
                )}>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                    <RadioGroup
                      value={
                        // Convert stored index back to option text for display
                        typeof answers[currentQuestion.id] === 'number' && currentQuestion.options[answers[currentQuestion.id]]
                          ? currentQuestion.options[answers[currentQuestion.id]]
                          : answers[currentQuestion.id] || ''
                      }
                      onValueChange={handleMCQAnswerChange}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option: string, idx: number) => (
                        <div key={idx} className={cn(
                          "flex items-center rounded-lg border hover:bg-gray-50",
                          isMobile ? "space-x-2 p-2" : "space-x-3 p-3"
                        )}>
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className={cn(
                            "cursor-pointer flex-1",
                            isMobile ? "text-sm" : "text-base"
                          )}>
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.question_type === 'scenario' && currentQuestion.options && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Choose the best approach:</h4>
                      <RadioGroup
                        value={
                          // Convert stored index back to option text for display
                          typeof answers[currentQuestion.id] === 'number' && currentQuestion.options[answers[currentQuestion.id]]
                            ? currentQuestion.options[answers[currentQuestion.id]]
                            : answers[currentQuestion.id] || ''
                        }
                        onValueChange={handleMCQAnswerChange}
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option: string, idx: number) => (
                          <div key={idx} className={cn(
                            "flex items-start rounded-lg border hover:bg-gray-50",
                            isMobile ? "space-x-2 p-3" : "space-x-3 p-4"
                          )}>
                            <RadioGroupItem value={option} id={`scenario-option-${idx}`} className="mt-1" />
                            <Label htmlFor={`scenario-option-${idx}`} className={cn(
                              "cursor-pointer flex-1",
                              isMobile ? "text-xs" : "text-sm"
                            )}>
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssessmentView;
