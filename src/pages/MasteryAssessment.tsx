import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useNavigation } from '@/contexts/NavigationContext';
import MasteryAssessmentPreview from '@/components/MasteryAssessmentPreview';
import ImprovedCodeEditor from '@/components/ImprovedCodeEditor';
import EnhancedAssessmentView from '@/components/EnhancedAssessmentView';

const MasteryAssessment = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const attemptId = searchParams.get('attempt');
  const { restrictNavigation, allowNavigation } = useNavigation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5400); // Default 90 minutes
  const [isStarted, setIsStarted] = useState(false);

  // Fetch mastery assessment details
  const { data: assessment } = useQuery({
    queryKey: ['mastery-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId) throw new Error('Assessment ID is required');
      
      const { data, error } = await supabase
        .from('mastery_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId,
  });

  // Fetch questions for this mastery assessment from the new table
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['mastery-assessment-questions', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];

      console.log('Fetching questions for mastery assessment:', assessmentId);

      const { data, error } = await supabase
        .from('mastery_assessment_questions')
        .select('*')
        .eq('mastery_assessment_id', assessmentId)
        .limit(assessment?.total_questions || 50)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched mastery assessment questions:', data?.length || 0);
      console.log('Sample question data:', data?.[0]);
      if (data?.[0]) {
        console.log('Test cases:', data[0].test_cases);
      }
      return data || [];
    },
    enabled: !!assessmentId && !!assessment,
  });

  // Fetch user attempt
  const { data: userAttempt } = useQuery({
    queryKey: ['user-mastery-attempt', attemptId],
    queryFn: async () => {
      if (!attemptId) return null;
      
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!attemptId,
  });

  useEffect(() => {
    if (assessment?.time_limit_minutes) {
      setTimeLeft(assessment.time_limit_minutes * 60);
    }
  }, [assessment]);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleSubmitAssessment();
    }
  }, [timeLeft, isStarted, isCompleted]);

  // Manage navigation restrictions
  useEffect(() => {
    if (isStarted && !isCompleted) {
      restrictNavigation('Mastery assessment in progress');
    } else {
      allowNavigation();
    }

    // Cleanup on unmount
    return () => {
      allowNavigation();
    };
  }, [isStarted, isCompleted, restrictNavigation, allowNavigation]);

  const updateAttempt = useMutation({
    mutationFn: async (data: any) => {
      if (!attemptId) throw new Error('Attempt ID is required');

      console.log('updateAttempt: Updating attempt with ID:', attemptId);
      console.log('updateAttempt: Data being sent to database:', data);

      const { data: result, error } = await supabase
        .from('user_mastery_attempts')
        .update(data)
        .eq('id', attemptId)
        .select(); // Add select to see what was actually saved

      if (error) {
        console.error('updateAttempt: Database error:', error);
        throw error;
      }

      console.log('updateAttempt: Successfully updated, result:', result);
      return result;
    },
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Transform questions and answers to match EnhancedAssessmentView interface
  // These must be at the top level to avoid hook order issues
  const transformedQuestions = useMemo(() => {
    return questions.map(q => {
      // For mastery assessments, questions come directly from mastery_assessment_questions table
      // No need to check for question_bank property since the data is already flattened
      return {
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
        domain: q.domain,
        tags: q.tags
      };
    });
  }, [questions]);

  const transformedAnswers = useMemo(() => {
    const answersArray = Array.isArray(answers) ? answers : [];
    console.log('Transforming answers:', { answersArray, questionsLength: questions.length });

    const transformed = questions.reduce((acc, question, index) => {
      // For mastery assessments, questions come directly from mastery_assessment_questions table
      const answer = answersArray[index];

      // Include all answers, even undefined ones, so EnhancedAssessmentView can track them
      acc[question.id] = answer;

      console.log(`Question ${index}: ${question.id} -> ${answer}`);
      return acc;
    }, {} as Record<string, any>);

    console.log('Transformed answers result:', transformed);
    return transformed;
  }, [answers, questions]);

  const handleAnswerSelect = (answer: number | string) => {
    console.log('handleAnswerSelect called:', { currentQuestion, answer, currentAnswers: answers });
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    console.log('Updated answers:', newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    setIsCompleted(true);

    // Ensure answers is an array for score calculation
    const answersArray = Array.isArray(answers) ? answers : [];
    const score = answersArray.reduce((total, answer, index) => {
      const question = questions[index];
      if (question?.question_type === 'mcq') {
        const options = question.options;
        if (Array.isArray(options) && options.every(opt => typeof opt === 'string')) {
          const correctIndex = options.indexOf(question.correct_answer);
          return total + (answer === correctIndex ? 1 : 0);
        }
      }
      return total + (answer.toString() === question?.correct_answer ? 1 : 0);
    }, 0);

    try {
      console.log('Submitting mastery assessment with answers:', answers);
      console.log('Answers type:', typeof answers, 'Is array:', Array.isArray(answers));
      console.log('Answers length:', Array.isArray(answers) ? answers.length : 'not array');
      console.log('Questions length:', questions.length);
      console.log('Non-undefined answers:', Array.isArray(answers) ? answers.filter(a => a !== undefined).length : 'not array');

      const submissionData = {
        score,
        total_questions: questions.length,
        answers: answers,
        completed_at: new Date().toISOString(),
        time_taken: (assessment?.time_limit_minutes || 90) * 60 - timeLeft,
      };

      console.log('Full submission data:', submissionData);

      await updateAttempt.mutateAsync(submissionData);

      // Allow navigation after successful submission
      allowNavigation();

      toast({
        title: "Assessment completed",
        description: `You scored ${score}/${questions.length}`,
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (!assessment || !attemptId) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment not found</h1>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

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

  if (questions.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h1>
            <p className="text-gray-600 mb-6">
              This mastery assessment doesn't have any questions yet.
            </p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!isStarted) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => {
              if (isStarted && !isCompleted) {
                toast({
                  title: "Cannot navigate away",
                  description: "Assessment is in progress. Please complete it first.",
                  variant: "destructive",
                });
              } else {
                navigate('/');
              }
            }}
            className="mb-6 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>

          <MasteryAssessmentPreview
            assessment={assessment}
            questions={questions}
            timeLeft={timeLeft}
            onStartAssessment={() => setIsStarted(true)}
            isLoading={isLoading}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (isCompleted) {
    // Ensure answers is an array for score calculation
    const answersArray = Array.isArray(answers) ? answers : [];

    // Calculate number of attempted questions (non-undefined answers)
    const attemptedQuestions = answersArray.filter(answer =>
      answer !== undefined && answer !== null && answer !== ''
    ).length;

    const score = answersArray.reduce((total, answer, index) => {
      const question = questions[index];
      if (question?.question_type === 'mcq') {
        const options = question.options;
        if (Array.isArray(options) && options.every(opt => typeof opt === 'string')) {
          const correctIndex = options.indexOf(question.correct_answer);
          return total + (answer === correctIndex ? 1 : 0);
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
                <CardDescription>Here are your results for {assessment.title}</CardDescription>
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

                <Button 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }



  const handleAnswerChange = (questionId: string, answer: any) => {
    console.log('handleAnswerChange called:', { questionId, answer });
    const questionIndex = questions.findIndex(q => {
      const questionData = q.question_bank || q;
      return questionData.id === questionId;
    });
    console.log('Found question index:', questionIndex, 'for questionId:', questionId);
    if (questionIndex !== -1) {
      setAnswers(prev => {
        // Ensure prev is always treated as an array
        const currentAnswers = Array.isArray(prev) ? prev : [];
        const newAnswers = [...currentAnswers];
        newAnswers[questionIndex] = answer;
        console.log('Updated answers in handleAnswerChange:', newAnswers);
        console.log('Previous answers:', currentAnswers);
        console.log('Setting answer at index', questionIndex, 'to:', answer);
        return newAnswers;
      });
    } else {
      console.error('Question not found for ID:', questionId);
      console.error('Available question IDs:', questions.map(q => {
        const questionData = q.question_bank || q;
        return questionData.id;
      }));
    }
  };

  const handleEnhancedSubmit = () => {
    handleSubmitAssessment(); // Submit directly, bypass question navigation logic
  };

  // Show enhanced assessment view only when started and not completed
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
          title={assessment?.title || 'Mastery Assessment'}
        />
      </AuthenticatedLayout>
    );
  }

  // Fallback - should not reach here normally
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <p>Loading assessment...</p>
      </div>
    </AuthenticatedLayout>
  );
};

export default MasteryAssessment;
