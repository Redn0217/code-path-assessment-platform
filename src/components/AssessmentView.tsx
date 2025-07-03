
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ImprovedCodeEditor from './ImprovedCodeEditor';
import ResultsView from './ResultsView';
import { useToast } from '@/hooks/use-toast';

interface AssessmentResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  strongAreas: string[];
  weakAreas: string[];
  detailedResults: any[];
  answers: Record<string, string>;
}

interface TagPerformance {
  correct: number;
  total: number;
}

const AssessmentView = ({ domain, difficulty, onComplete }: { domain: any; difficulty: string; onComplete: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60 * 45); // Default 45 minutes
  const [startTime] = useState(Date.now());
  const [insufficientQuestions, setInsufficientQuestions] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any[]>>({});
  
  // Fetch assessment configuration for time settings
  const { data: config } = useQuery({
    queryKey: ['assessment-config', domain.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_configs')
        .select('*')
        .eq('domain', domain.id)
        .single();
      if (error) {
        console.error('No assessment config found, using defaults');
        return { total_time_minutes: 45 }; // Default config
      }
      return data;
    },
  });

  // Fetch ALL questions from the selected domain
  const { data: availableQuestions, isLoading, error: questionsError } = useQuery({
    queryKey: ['assessment-questions', domain.id],
    queryFn: async () => {
      console.log('Fetching ALL questions for domain:', domain.id);
      
      // Fetch all questions for this domain
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('domain', domain.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
      
      console.log('Found questions:', allQuestions?.length || 0);
      
      if (!allQuestions || allQuestions.length === 0) {
        setInsufficientQuestions(`No questions available for ${domain.name} assessment.`);
        return [];
      }
      
      // Shuffle all questions
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      console.log('Final assessment questions:', shuffledQuestions.length);
      
      return shuffledQuestions;
    },
    enabled: !!domain,
    staleTime: 0,
    gcTime: 0,
  });

  // Save assessment result
  const saveAssessment = useMutation({
    mutationFn: async (assessmentData: AssessmentResults) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('assessments')
        .insert([{
          user_id: user.id,
          domain: domain.id,
          difficulty,
          score: assessmentData.score,
          total_questions: questions.length,
          answers: assessmentData.answers,
          question_ids: questions.map((q: any) => q.id),
          time_taken: Math.floor((Date.now() - startTime) / 1000),
          strong_areas: assessmentData.strongAreas,
          weak_areas: assessmentData.weakAreas,
          detailed_results: assessmentData.detailedResults,
        }]);

      if (error) throw error;
      return assessmentData;
    },
    onSuccess: () => {
      toast({ title: 'Assessment saved successfully!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error saving assessment', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  useEffect(() => {
    if (availableQuestions?.length > 0) {
      setQuestions(availableQuestions);
      
      // Initialize answers
      const initialAnswers: Record<string, string> = {};
      availableQuestions.forEach((q: any) => {
        initialAnswers[q.id] = q.question_type === 'coding' ? (q.code_template || '') : '';
      });
      setAnswers(initialAnswers);
      
      // Set timer from config
      if (config?.total_time_minutes) {
        setTimeRemaining(config.total_time_minutes * 60);
      }
    }
  }, [availableQuestions, config]);

  // Invalidate questions cache when component mounts to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['assessment-questions'] });
  }, [queryClient]);
  
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleTestResults = (questionId: string, results: any[]) => {
    console.log(`🏆 Received test results for question ${questionId}:`, results);
    setTestResults(prev => ({
      ...prev,
      [questionId]: results
    }));
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const calculateResults = (): AssessmentResults => {
    let correctAnswers = 0;
    const detailedResults: any[] = [];
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    questions.forEach((question: any) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let questionScore = 0;

      if (question.question_type === 'coding') {
        // For coding questions, use test case results for scoring
        const questionTestResults = testResults[question.id];
        if (questionTestResults && questionTestResults.length > 0) {
          const passedTests = questionTestResults.filter(r => r.passed).length;
          const totalTests = questionTestResults.length;
          questionScore = totalTests > 0 ? passedTests / totalTests : 0;
          isCorrect = questionScore >= 0.5; // Consider 50%+ test cases passed as correct

          console.log(`🏆 Coding Question ${question.id} Score:`, {
            passedTests,
            totalTests,
            score: questionScore,
            percentage: Math.round(questionScore * 100),
            isCorrect
          });
        } else {
          // No test results available, fallback to simple comparison
          isCorrect = userAnswer === question.correct_answer;
        }
      } else {
        // For MCQ and other question types, use simple comparison
        isCorrect = userAnswer === question.correct_answer;
        questionScore = isCorrect ? 1 : 0;
      }

      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionId: question.id,
        question: question.question_text,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        questionScore,
        testResults: question.question_type === 'coding' ? testResults[question.id] : undefined,
        explanation: question.explanation,
        tags: question.tags,
      });
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Analyze strong and weak areas based on tags
    const tagPerformance: Record<string, TagPerformance> = {};
    detailedResults.forEach(result => {
      if (result.tags) {
        result.tags.forEach((tag: string) => {
          if (!tagPerformance[tag]) tagPerformance[tag] = { correct: 0, total: 0 };
          tagPerformance[tag].total++;
          if (result.isCorrect) tagPerformance[tag].correct++;
        });
      }
    });
    
    Object.entries(tagPerformance).forEach(([tag, performance]) => {
      const percentage = (performance.correct / performance.total) * 100;
      if (percentage >= 80) {
        strongAreas.push(tag);
      } else if (percentage < 60) {
        weakAreas.push(tag);
      }
    });
    
    return {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      strongAreas,
      weakAreas,
      detailedResults,
      answers
    };
  };
  
  const handleSubmit = () => {
    const results = calculateResults();
    saveAssessment.mutate(results);
    setIsCompleted(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Show insufficient questions error
  if (insufficientQuestions) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Assessment Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {insufficientQuestions}
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <p className="text-gray-600 mb-4">
                  This assessment cannot be started because there are no questions available in the database. 
                  Please contact an administrator to add questions for the {domain.name} domain.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onComplete} variant="outline">
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  if (isCompleted) {
    return (
      <ResultsView 
        domain={domain} 
        difficulty={difficulty} 
        questions={questions} 
        answers={answers} 
        onComplete={onComplete} 
      />
    );
  }
  
  if (isLoading || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Assessment header */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{domain.name} Assessment ({difficulty})</CardTitle>
              <div className={`py-1 px-3 rounded-full text-sm font-medium ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Time: {formatTime(timeRemaining)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>
                {Object.values(answers).filter(a => a !== null && a !== '').length} of {questions.length} answered
              </span>
            </div>
            <Progress value={(currentQuestionIndex + 1) * 100 / questions.length} className="h-2" />
          </CardContent>
        </Card>
        
        {/* Question */}
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  answers[currentQuestion.id] ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <Badge variant="outline">
                  {currentQuestion.question_type === 'mcq' ? 'Multiple Choice' : 
                   currentQuestion.question_type === 'coding' ? 'Coding Challenge' : 'Scenario-Based'}
                </Badge>
                <Badge className={
                  currentQuestion.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                  currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.title}</h3>
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{currentQuestion.question_text}</p>
            </div>
            
            {currentQuestion.question_type === 'mcq' && (
              <RadioGroup 
                value={answers[currentQuestion.id] || ''} 
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQuestion.question_type === 'coding' && (
              <ImprovedCodeEditor
                language={domain.id === 'python' ? 'python' : domain.id === 'linux' ? 'bash' : 'javascript'}
                value={answers[currentQuestion.id] || currentQuestion.code_template || ''}
                onChange={(code) => handleAnswerChange(currentQuestion.id, code)}
                testCases={currentQuestion.test_cases || []}
                timeLimit={currentQuestion.time_limit}
                memoryLimit={currentQuestion.memory_limit}
              />
            )}
            
            {currentQuestion.question_type === 'scenario' && (
              <RadioGroup 
                value={answers[currentQuestion.id] || ''} 
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 p-3 border rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={option} id={`scenario-${idx}`} className="mt-1" />
                    <Label htmlFor={`scenario-${idx}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full flex justify-between">
              <Button 
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => navigateQuestion('prev')}
              >
                Previous
              </Button>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => navigateQuestion('next')}>Next</Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={saveAssessment.isPending}
                >
                  {saveAssessment.isPending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        
        {/* Question navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {questions.map((q: any, idx: number) => (
                <Button 
                  key={q.id}
                  variant={idx === currentQuestionIndex ? "default" : "outline"}
                  className={`h-10 w-10 p-0 ${
                    answers[q.id] && answers[q.id] !== '' ? 'border-green-500 bg-green-50' : ''
                  } ${idx === currentQuestionIndex ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentView;
