import React, { useState, useEffect } from 'react';
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

const MasteryAssessment = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const attemptId = searchParams.get('attempt');
  const { restrictNavigation, allowNavigation } = useNavigation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
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
      
      const { error } = await supabase
        .from('user_mastery_attempts')
        .update(data)
        .eq('id', attemptId);
      
      if (error) throw error;
    },
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
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

    const score = answers.reduce((total, answer, index) => {
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
      await updateAttempt.mutateAsync({
        score,
        total_questions: questions.length,
        answers: answers,
        completed_at: new Date().toISOString(),
        time_taken: (assessment?.time_limit_minutes || 90) * 60 - timeLeft,
      });

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
    const score = answers.reduce((total, answer, index) => {
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
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score</span>
                      <span>{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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

  const currentQ = questions[currentQuestion];

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{assessment.title}</Badge>
                <Badge variant="outline">{currentQ?.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h2 className="text-xl font-semibold">{currentQ?.title}</h2>

              {/* Question Text */}
              {currentQ?.question_text && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{currentQ.question_text}</p>
                </div>
              )}

              <div className="space-y-3">
                {currentQ?.question_type === 'mcq' && Array.isArray(currentQ?.options) && 
                 currentQ.options.every((opt: any) => typeof opt === 'string') && 
                 (currentQ.options as string[]).map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={answers[currentQuestion] === index ? "default" : "outline"}
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="mr-3 font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isStarted && !isCompleted) {
                      toast({
                        title: "Cannot exit assessment",
                        description: "Please complete your assessment first or submit it to exit.",
                        variant: "destructive",
                      });
                    } else {
                      navigate('/');
                    }
                  }}
                  className={isStarted && !isCompleted ? 'cursor-not-allowed opacity-60' : ''}
                >
                  Exit Assessment
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={answers[currentQuestion] === undefined}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default MasteryAssessment;
