
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import ModuleSelection from '@/components/ModuleSelection';
import AssessmentPreview from '@/components/AssessmentPreview';
import ImprovedCodeEditor from '@/components/ImprovedCodeEditor';
import EnhancedAssessmentView from '@/components/EnhancedAssessmentView';
import { Module } from '@/types/module';

const domains = {
  python: { name: 'Python', color: 'bg-blue-500' },
  devops: { name: 'DevOps', color: 'bg-green-500' },
  cloud: { name: 'Cloud Computing', color: 'bg-sky-500' },
  linux: { name: 'Linux', color: 'bg-orange-500' },
  networking: { name: 'Networking', color: 'bg-purple-500' },
  storage: { name: 'Storage', color: 'bg-indigo-500' },
  virtualization: { name: 'Virtualization', color: 'bg-pink-500' },
  'object-storage': { name: 'Object Storage', color: 'bg-cyan-500' },
  'ai-ml': { name: 'AI & ML', color: 'bg-red-500' },
  'data-security': { name: 'Data Security', color: 'bg-emerald-500' },
  'data-science': { name: 'Data Science', color: 'bg-violet-500' }
};

const Assessment = () => {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number | string}>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // Default 30 minutes
  const [isStarted, setIsStarted] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, any[]>>({});

  const domainInfo = domain ? domains[domain as keyof typeof domains] : null;

  // Generate assessment based on configuration
  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: ['generated-assessment', selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return null;

      console.log('Generating assessment for module:', selectedModule.id);

      try {
        const { AssessmentGenerator } = await import('@/services/assessmentGenerator');
        const generatedAssessment = await AssessmentGenerator.generateAssessment(selectedModule.id);

        console.log('Generated assessment:', {
          totalQuestions: generatedAssessment.questions.length,
          metadata: generatedAssessment.metadata
        });

        // Debug test cases in generated questions
        const codingQuestions = generatedAssessment.questions.filter(q => q.question_type === 'coding');
        console.log('Coding questions found:', codingQuestions.length);
        if (codingQuestions.length > 0) {
          console.log('Sample coding question:', codingQuestions[0]);
          console.log('Test cases in sample:', codingQuestions[0].test_cases);
        }

        return generatedAssessment;
      } catch (error) {
        console.error('Error generating assessment:', error);

        // Fallback: fetch all questions if generation fails
        console.log('Falling back to all questions...');
        const { data, error: fallbackError } = await supabase
          .from('questions')
          .select(`
            id,
            module_id,
            created_at,
            question_bank_id,
            question_bank!inner(
              id,
              title,
              question_text,
              question_type,
              difficulty,
              domain,
              options,
              correct_answer,
              explanation,
              code_template,
              test_cases,
              time_limit,
              memory_limit,
              tags,
              is_active
            )
          `)
          .eq('module_id', selectedModule.id)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        // Transform fallback data to match AssessmentGenerator format
        const transformedFallbackData = data?.map(item => ({
          id: item.question_bank_id, // Use question bank ID as the main ID
          module_id: item.module_id,
          created_at: item.created_at,
          // Flatten question bank content with proper typing
          ...item.question_bank,
          question_type: item.question_bank.question_type as 'mcq' | 'coding' | 'scenario',
          difficulty: item.question_bank.difficulty as 'beginner' | 'intermediate' | 'advanced',
          options: Array.isArray(item.question_bank.options) ? item.question_bank.options as string[] : undefined,
          test_cases: Array.isArray(item.question_bank.test_cases) ? item.question_bank.test_cases as any[] : [],
          tags: Array.isArray(item.question_bank.tags) ? item.question_bank.tags as string[] : [],
        })) || [];

        console.log('Fallback data transformed:', transformedFallbackData.length, 'questions');
        console.log('Sample fallback question:', transformedFallbackData[0]);

        return {
          questions: transformedFallbackData,
          config: null,
          metadata: {
            total_questions: transformedFallbackData.length,
            mcq_count: 0,
            coding_count: 0,
            scenario_count: 0,
            difficulty_breakdown: { beginner: 0, intermediate: 0, advanced: 0 },
            estimated_time_minutes: 30
          }
        };
      }
    },
    enabled: !!selectedModule,
  });

  // Extract questions and config from assessment data
  const questions = assessmentData?.questions || [];
  const assessmentConfig = assessmentData?.config;

  // Assessment config is now included in the generated assessment data

  useEffect(() => {
    if (assessmentConfig?.total_time_minutes) {
      setTimeLeft(assessmentConfig.total_time_minutes * 60);
    }
  }, [assessmentConfig]);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmitAssessment();
    }
  }, [timeLeft, isStarted, isCompleted]);

  if (!domainInfo) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain not found</h1>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show module selection if no module is selected
  if (!selectedModule) {
    return (
      <AuthenticatedLayout>
        <ModuleSelection
          domain={domain!}
          domainInfo={domainInfo}
          onModuleSelect={setSelectedModule}
          onBack={() => navigate('/')}
        />
      </AuthenticatedLayout>
    );
  }



  const handleSubmitAssessment = async () => {
    setIsCompleted(true);

    // Calculate number of attempted questions (non-undefined answers)
    questions.filter((_, index) =>
      answers[index] !== undefined && answers[index] !== null && answers[index] !== ''
    ).length;

    // Calculate score with proper type checking and test case results
    const score = questions.reduce((total, question, index) => {
      const answer = answers[index];
      if (answer === undefined) return total;

      if (question?.question_type === 'mcq') {
        // Type guard to ensure options is an array of strings
        const options = question.options;
        if (Array.isArray(options) && options.every(opt => typeof opt === 'string')) {
          const correctIndex = options.indexOf(question.correct_answer);
          return total + (answer === correctIndex ? 1 : 0);
        }
      } else if (question?.question_type === 'coding') {
        // For coding questions, use test case results for scoring
        const questionTestResults = testResults[question.id];
        if (questionTestResults && questionTestResults.length > 0) {
          const passedTests = questionTestResults.filter(r => r.passed).length;
          const totalTests = questionTestResults.length;
          const questionScore = totalTests > 0 ? passedTests / totalTests : 0;

          console.log(`🏆 Coding Question ${question.id} Final Score:`, {
            passedTests,
            totalTests,
            score: questionScore,
            percentage: Math.round(questionScore * 100)
          });

          // Add the percentage score (0-1) to total
          return total + questionScore;
        } else {
          // Fallback to simple comparison if no test results
          return total + (answer.toString().trim() === question.correct_answer?.trim() ? 1 : 0);
        }
      }
      return total + (answer.toString() === question?.correct_answer ? 1 : 0);
    }, 0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            domain: domain || '',
            module_id: selectedModule.id,
            difficulty: 'beginner',
            score,
            total_questions: questions.length,
            answers: questions.map((_, index) => answers[index]), // Ensure answers are in question order
            question_ids: questions.map(q => q.id),
            strong_areas: score > questions.length * 0.7 ? [domain || ''] : [],
            weak_areas: score <= questions.length * 0.5 ? [domain || ''] : []
          });

        if (error) {
          console.error('Error saving assessment:', error);
          toast({
            title: "Error saving assessment",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Assessment completed",
            description: `You scored ${score}/${questions.length}`,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error loading assessment</h1>
            <p className="text-gray-600 mb-6">There was an error loading the questions.</p>
            <Button onClick={() => setSelectedModule(null)}>Back to Modules</Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Coming Soon</h1>
            <p className="text-gray-600 mb-6">
              The {selectedModule.name} assessment is currently being prepared. Check back soon!
            </p>
            <Button onClick={() => setSelectedModule(null)}>Back to Modules</Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!isStarted && showPreview) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedModule(null)}
            className="mb-6 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Modules</span>
          </Button>

          <AssessmentPreview
            assessmentData={assessmentData}
            moduleName={selectedModule.name}
            onStartAssessment={() => {
              setShowPreview(false);
              setIsStarted(true);
            }}
            isLoading={isLoading}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (isCompleted) {
    // Calculate number of attempted questions (non-undefined answers)
    const attemptedQuestions = questions.filter((_, index) =>
      answers[index] !== undefined && answers[index] !== null && answers[index] !== ''
    ).length;

    // Calculate score with proper type checking for results page
    const score = questions.reduce((total, question, index) => {
      const answer = answers[index];
      if (answer === undefined) return total;

      if (question?.question_type === 'mcq') {
        const options = question.options;
        if (Array.isArray(options) && options.every(opt => typeof opt === 'string')) {
          const correctIndex = options.indexOf(question.correct_answer);
          return total + (answer === correctIndex ? 1 : 0);
        }
      } else if (question?.question_type === 'coding') {
        // For coding questions, use test case results for scoring
        const questionTestResults = testResults[question.id];
        if (questionTestResults && questionTestResults.length > 0) {
          const passedTests = questionTestResults.filter(r => r.passed).length;
          const totalTests = questionTestResults.length;
          const questionScore = totalTests > 0 ? passedTests / totalTests : 0;
          return total + questionScore;
        } else {
          // Fallback to simple comparison if no test results
          return total + (answer.toString().trim() === question.correct_answer?.trim() ? 1 : 0);
        }
      }
      return total + (answer.toString() === question?.correct_answer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {percentage >= 70 ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
                <CardDescription>Here are your results for {selectedModule.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{percentage}%</div>
                  <div className="text-lg text-gray-600">{score} out of {questions.length} correct</div>
                  <div className="text-sm text-gray-500 mt-1">{attemptedQuestions} out of {questions.length} attempted</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{attemptedQuestions}</div>
                      <div className="text-sm text-blue-700">Attempted</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{score}</div>
                      <div className="text-sm text-green-700">Correct</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                      <div className="text-sm text-red-700">Incorrect</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => setSelectedModule(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Modules
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentQuestion(0);
                      setAnswers({});
                      setIsCompleted(false);
                      setTimeLeft(assessmentConfig?.total_time_minutes ? assessmentConfig.total_time_minutes * 60 : 1800);
                      setIsStarted(false);
                      setShowPreview(true); // Show preview again for retake
                    }}
                    className="flex-1"
                  >
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Transform questions to match EnhancedAssessmentView interface
  const transformedQuestions = questions.map(q => ({
    id: q.id,
    title: q.title,
    question_text: q.question_text,
    question_type: q.question_type,
    difficulty: q.difficulty,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    code_template: q.code_template,
    test_cases: q.test_cases,
    time_limit: q.time_limit,
    memory_limit: q.memory_limit,
    tags: q.tags,
    domain: domain
  }));

  // Transform answers to match EnhancedAssessmentView interface
  const transformedAnswers = questions.reduce((acc, question, index) => {
    if (answers[index] !== undefined) {
      acc[question.id] = answers[index];
    }
    return acc;
  }, {} as Record<string, any>);

  const handleAnswerChange = (questionId: string, answer: any) => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: answer
      }));
    }
  };

  const handleTestResults = (questionId: string, results: any[]) => {
    console.log(`🏆 Received test results for question ${questionId}:`, results);
    setTestResults(prev => ({
      ...prev,
      [questionId]: results
    }));
  };

  const handleEnhancedSubmit = () => {
    handleSubmitAssessment(); // Submit directly, bypass question navigation logic
  };

  // Show enhanced assessment view only when started
  if (isStarted && !isCompleted) {
    return (
      <AuthenticatedLayout>
        <EnhancedAssessmentView
          questions={transformedQuestions}
          answers={transformedAnswers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleEnhancedSubmit}
          timeLeft={timeLeft}
          isSubmitting={false}
          title={selectedModule?.name || 'Practice Assessment'}
          onTestResults={handleTestResults}
        />
      </AuthenticatedLayout>
    );
  }

  // Fallback - should not reach here normally
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing assessment...</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Assessment;
