import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Target, TrendingUp, CheckCircle, XCircle, Award } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Assessment {
  id: string;
  domain: string;
  module_id: string;
  difficulty: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number;
  strong_areas: string[];
  weak_areas: string[];
  answers: any[];
  question_ids: string[];
}

interface Question {
  id: string;
  title: string;
  question_text: string;
  difficulty: string;
  correct_answer: string;
  options?: string[];
}

interface AssessmentAnalyticsProps {
  assessment: Assessment;
  user: User;
  onBack: () => void;
}

const AssessmentAnalytics: React.FC<AssessmentAnalyticsProps> = ({ 
  assessment, 
  user, 
  onBack 
}) => {
  // Fetch questions for detailed analysis
  const { data: questions = [] } = useQuery({
    queryKey: ['assessment-questions', assessment.question_ids],
    queryFn: async () => {
      if (!assessment.question_ids || assessment.question_ids.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('questions')
        .select('id, title, question_text, difficulty, correct_answer, options')
        .in('id', assessment.question_ids);

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!assessment.question_ids?.length,
  });

  const scorePercentage = Math.round((assessment.score / assessment.total_questions) * 100);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate question-by-question performance
  const questionAnalysis = questions.map((question, index) => {
    const userAnswer = assessment.answers[index];
    let isCorrect = false;
    
    if (question.options && Array.isArray(question.options)) {
      // MCQ question
      const correctIndex = question.options.indexOf(question.correct_answer);
      isCorrect = userAnswer === correctIndex;
    } else {
      // Other question types
      isCorrect = userAnswer === question.correct_answer;
    }

    return {
      question,
      userAnswer,
      isCorrect,
      index: index + 1
    };
  });

  const correctAnswers = questionAnalysis.filter(q => q.isCorrect).length;
  const incorrectAnswers = questionAnalysis.length - correctAnswers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {user.full_name || user.email}</span>
        </Button>
      </div>

      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assessment Analytics</span>
            <Badge className={getDifficultyColor(assessment.difficulty)}>
              {assessment.difficulty}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{scorePercentage}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{assessment.score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {assessment.total_questions - assessment.score}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {assessment.time_taken ? Math.round(assessment.time_taken / 60) : '?'}m
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Performance</span>
                <span className={getPerformanceColor(scorePercentage)}>{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Domain:</strong> <span className="capitalize">{assessment.domain}</span>
              </div>
              <div>
                <strong>Completed:</strong> {format(new Date(assessment.completed_at), 'PPP p')}
              </div>
              <div>
                <strong>Total Questions:</strong> {assessment.total_questions}
              </div>
              <div>
                <strong>Time Taken:</strong> {assessment.time_taken ? formatTime(assessment.time_taken) : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      {(assessment.strong_areas?.length > 0 || assessment.weak_areas?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessment.strong_areas?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Strong Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assessment.strong_areas.map((area, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {assessment.weak_areas?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assessment.weak_areas.map((area, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800 mr-2 mb-2">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Question-by-Question Analysis */}
      {questionAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question-by-Question Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionAnalysis.map((analysis) => (
                <div 
                  key={analysis.question.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    analysis.isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Q{analysis.index}</span>
                      <Badge className={getDifficultyColor(analysis.question.difficulty)}>
                        {analysis.question.difficulty}
                      </Badge>
                      {analysis.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">{analysis.question.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{analysis.question.question_text}</p>
                  
                  {analysis.question.options && (
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">
                        Correct Answer: <span className="text-green-600">{analysis.question.correct_answer}</span>
                      </div>
                      {!analysis.isCorrect && (
                        <div className="font-medium">
                          User Answer: <span className="text-red-600">
                            {analysis.question.options[analysis.userAnswer] || 'No answer'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentAnalytics;
