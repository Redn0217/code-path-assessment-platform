
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CodeEditor from './CodeEditor';
import ResultsView from './ResultsView';
import { generateMockQuestions } from '@/lib/assessmentData';

const AssessmentView = ({ domain, difficulty, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60 * 45); // 45 minutes in seconds
  
  useEffect(() => {
    // Generate mock questions based on domain and difficulty
    const mockQuestions = generateMockQuestions(domain.id, difficulty);
    setQuestions(mockQuestions);
    
    // Initialize answers object
    const initialAnswers = {};
    mockQuestions.forEach(q => {
      initialAnswers[q.id] = q.type === 'code' ? '' : null;
    });
    setAnswers(initialAnswers);
    
    // Timer setup
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
  }, [domain, difficulty]);
  
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const navigateQuestion = (direction) => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    // Calculate results
    setIsCompleted(true);
  };
  
  // Format time remaining as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isCompleted) {
    return <ResultsView domain={domain} difficulty={difficulty} answers={answers} questions={questions} onComplete={onComplete} />;
  }
  
  if (!currentQuestion) {
    return <div className="flex justify-center items-center h-screen">Loading assessment...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Assessment header */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{domain.name} Assessment ({difficulty})</CardTitle>
              <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
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
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  answers[currentQuestion.id] ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} • {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 
                  currentQuestion.type === 'code' ? 'Coding Challenge' : 'Scenario-Based'}
                </span>
              </div>
              <span className={`text-sm ${
                currentQuestion.difficulty === 'easy' ? 'text-green-500' : 
                currentQuestion.difficulty === 'medium' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {currentQuestion.difficulty === 'easy' ? 'Easy' : 
                 currentQuestion.difficulty === 'medium' ? 'Medium' : 'Hard'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            
            {currentQuestion.type === 'mcq' && (
              <RadioGroup 
                value={answers[currentQuestion.id]} 
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQuestion.type === 'code' && (
              <div className="mb-4">
                <div className="bg-slate-100 p-3 rounded-md mb-4">
                  <p className="text-sm">{currentQuestion.instructions}</p>
                  {currentQuestion.example && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Example:</p>
                      <pre className="text-xs bg-slate-200 p-2 rounded mt-1 overflow-x-auto">
                        {currentQuestion.example}
                      </pre>
                    </div>
                  )}
                </div>
                <CodeEditor
                  language={domain.id === 'python' ? 'python' : domain.id === 'linux' ? 'bash' : 'javascript'}
                  value={answers[currentQuestion.id] || currentQuestion.template || ''}
                  onChange={(code) => handleAnswerChange(currentQuestion.id, code)}
                />
              </div>
            )}
            
            {currentQuestion.type === 'scenario' && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-md">
                  <p className="text-sm">{currentQuestion.scenario}</p>
                </div>
                <RadioGroup 
                  value={answers[currentQuestion.id]} 
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-3 border rounded-md">
                      <RadioGroupItem value={option} id={`scenario-${idx}`} className="mt-1" />
                      <Label htmlFor={`scenario-${idx}`} className="text-base">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
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
                <Button onClick={handleSubmit}>Submit Assessment</Button>
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
              {questions.map((q, idx) => (
                <Button 
                  key={q.id}
                  variant={idx === currentQuestionIndex ? "default" : "outline"}
                  className={`h-10 w-10 p-0 ${answers[q.id] ? 'border-green-500' : ''}`}
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
