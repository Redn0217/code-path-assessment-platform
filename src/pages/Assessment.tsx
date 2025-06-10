
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

// Sample questions for different domains
const sampleQuestions = {
  python: [
    {
      id: 1,
      question: "What is the output of: print(type([]))?",
      options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
      correct: 0,
      difficulty: "beginner"
    },
    {
      id: 2,
      question: "Which method is used to add an element to a list?",
      options: ["add()", "append()", "insert()", "push()"],
      correct: 1,
      difficulty: "beginner"
    }
  ],
  devops: [
    {
      id: 1,
      question: "What does CI/CD stand for?",
      options: ["Continuous Integration/Continuous Deployment", "Central Integration/Central Deployment", "Code Integration/Code Deployment", "Custom Integration/Custom Deployment"],
      correct: 0,
      difficulty: "beginner"
    },
    {
      id: 2,
      question: "Which tool is commonly used for containerization?",
      options: ["Vagrant", "Docker", "VirtualBox", "VMware"],
      correct: 1,
      difficulty: "beginner"
    }
  ]
};

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isStarted, setIsStarted] = useState(false);

  const domainInfo = domain ? domains[domain as keyof typeof domains] : null;
  const questions = domain && sampleQuestions[domain as keyof typeof sampleQuestions] ? sampleQuestions[domain as keyof typeof sampleQuestions] : [];

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
    
    // Calculate score
    const score = answers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correct ? 1 : 0);
    }, 0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            domain: domain || '',
            difficulty: 'beginner',
            score,
            total_questions: questions.length,
            answers: answers,
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

  if (questions.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Coming Soon</h1>
            <p className="text-gray-600 mb-6">
              The {domainInfo.name} assessment is currently being prepared. Check back soon!
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
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg ${domainInfo.color}`}>
                    <div className="h-6 w-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{domainInfo.name} Assessment</CardTitle>
                    <CardDescription>Test your knowledge in {domainInfo.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">30</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Mixed</div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Choose the best answer for each question</li>
                    <li>• You have 30 minutes to complete the assessment</li>
                    <li>• You cannot go back to previous questions</li>
                    <li>• Your progress will be saved automatically</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setIsStarted(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (isCompleted) {
    const score = answers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correct ? 1 : 0);
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
                <CardDescription>Here are your results for {domainInfo.name}</CardDescription>
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

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentQuestion(0);
                      setAnswers([]);
                      setIsCompleted(false);
                      setTimeLeft(1800);
                      setIsStarted(false);
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

  const currentQ = questions[currentQuestion];

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
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

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{domainInfo.name}</Badge>
                <Badge variant="outline">{currentQ?.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h2 className="text-xl font-semibold">{currentQ?.question}</h2>
              
              <div className="space-y-3">
                {currentQ?.options.map((option, index) => (
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
                  onClick={() => navigate('/')}
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

export default Assessment;
