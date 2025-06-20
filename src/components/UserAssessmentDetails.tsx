import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Target, TrendingUp, CheckCircle, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentData {
  id: string;
  attempt_id?: string; // For mastery assessments, this is the attempt ID
  assessment_type: 'practice' | 'mastery';
  assessment_title: string;
  percentage: number;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken?: number;
  difficulty?: string;
  domain?: string;
  domains?: string[];
  strong_areas?: string[];
  weak_areas?: string[];
  answers?: any[];
  question_ids?: string[];
}

interface Question {
  id: string;
  title: string;
  question_text: string;
  difficulty: string;
  correct_answer: string;
  options?: string[];
  question_type?: string;
}

interface UserAssessmentDetailsProps {
  assessment: AssessmentData;
  onBack: () => void;
}

const UserAssessmentDetails: React.FC<UserAssessmentDetailsProps> = ({ 
  assessment, 
  onBack 
}) => {
  // Fetch questions for detailed analysis
  const { data: questions = [] } = useQuery({
    queryKey: ['assessment-questions', assessment.id, assessment.assessment_type],
    queryFn: async () => {
      console.log('UserAssessmentDetails: Fetching questions for assessment:', {
        id: assessment.id,
        attempt_id: assessment.attempt_id,
        type: assessment.assessment_type,
        question_ids: assessment.question_ids
      });

      if (assessment.assessment_type === 'mastery') {
        // For mastery assessments, fetch from mastery_assessment_questions table
        const { data, error } = await supabase
          .from('mastery_assessment_questions')
          .select('id, title, question_text, difficulty, correct_answer, options, question_type')
          .eq('mastery_assessment_id', assessment.id)
          .order('created_at', { ascending: true }); // Maintain order for answer matching

        if (error) {
          console.error('Error fetching mastery questions:', error);
          return [];
        }

        console.log('UserAssessmentDetails: Fetched mastery questions:', data?.length || 0);
        return data || [];
      } else {
        // For regular assessments, fetch from questions table
        if (!assessment.question_ids || assessment.question_ids.length === 0) {
          console.log('UserAssessmentDetails: No question_ids found for regular assessment');
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

        console.log('UserAssessmentDetails: Fetched regular questions:', data?.length || 0);
        return data || [];
      }
    },
    enabled: assessment.assessment_type === 'mastery' || !!assessment.question_ids?.length,
  });

  const scorePercentage = assessment.percentage;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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
    let userAnswer;

    if (assessment.assessment_type === 'mastery') {
      // For mastery assessments, answers are stored as an object with indices as keys
      userAnswer = assessment.answers?.[index.toString()];
    } else {
      // For regular assessments, answers are stored as an array
      userAnswer = assessment.answers?.[index];
    }

    console.log(`UserAssessmentDetails: Question ${index + 1} analysis:`, {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correct_answer,
      hasOptions: !!question.options,
      assessmentType: assessment.assessment_type
    });

    let isCorrect = false;

    if (question.options && Array.isArray(question.options)) {
      // MCQ question
      const correctIndex = question.options.indexOf(question.correct_answer);
      isCorrect = userAnswer === correctIndex;
    } else {
      // Other question types (coding, scenario)
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

  // Debug logging
  console.log('UserAssessmentDetails: Analysis summary:', {
    questionsCount: questions.length,
    questionAnalysisCount: questionAnalysis.length,
    assessmentType: assessment.assessment_type,
    assessmentId: assessment.id,
    hasAnswers: !!assessment.answers,
    answersType: typeof assessment.answers,
    answersKeys: assessment.answers ? Object.keys(assessment.answers) : 'no answers'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Performance</span>
        </Button>
      </div>

      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{assessment.assessment_title}</span>
            {assessment.difficulty && (
              <Badge className={getDifficultyColor(assessment.difficulty)}>
                {assessment.difficulty}
              </Badge>
            )}
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
                <strong>Type:</strong> <span className="capitalize">
                  {assessment.assessment_type === 'mastery' ? 'Mastery Assessment' : 'Practice Assessment'}
                </span>
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
              {assessment.domain && (
                <div>
                  <strong>Domain:</strong> <span className="capitalize">{assessment.domain}</span>
                </div>
              )}
              {assessment.domains && assessment.domains.length > 0 && (
                <div>
                  <strong>Domains:</strong> <span className="capitalize">{assessment.domains.join(', ')}</span>
                </div>
              )}
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
      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {questionAnalysis.length > 0 ? (
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

                  <div className="space-y-1 text-sm">
                    {analysis.question.options && Array.isArray(analysis.question.options) ? (
                      // MCQ Question
                      <>
                        <div className="font-medium">
                          Correct Answer: <span className="text-green-600">{analysis.question.correct_answer}</span>
                        </div>
                        {!analysis.isCorrect && (
                          <div className="font-medium">
                            Your Answer: <span className="text-red-600">
                              {analysis.question.options[analysis.userAnswer] || 'No answer'}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      // Non-MCQ Question (Coding, Scenario)
                      <>
                        <div className="font-medium">
                          Correct Answer: <span className="text-green-600">{analysis.question.correct_answer}</span>
                        </div>
                        {!analysis.isCorrect && (
                          <div className="font-medium">
                            Your Answer: <span className="text-red-600">
                              {analysis.userAnswer !== undefined && analysis.userAnswer !== null
                                ? analysis.userAnswer.toString()
                                : 'No answer provided'}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Show question type for mastery assessments */}
                    {assessment.assessment_type === 'mastery' && analysis.question.question_type && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <Badge variant="outline" className="text-xs">
                          {analysis.question.question_type.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Target className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">No Question Analysis Available</p>
                <p className="text-sm mt-2">
                  {assessment.assessment_type === 'mastery'
                    ? 'Questions for this mastery assessment could not be loaded.'
                    : 'Questions for this practice assessment could not be loaded.'}
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Assessment Type: {assessment.assessment_type}</p>
                <p>Assessment ID: {assessment.id}</p>
                <p>Attempt ID: {assessment.attempt_id || 'N/A'}</p>
                <p>Questions Found: {questions.length}</p>
                <p>Has Answers: {assessment.answers ? 'Yes' : 'No'}</p>
                <p>Answers Type: {typeof assessment.answers}</p>
                <p>Question IDs: {assessment.question_ids?.length || 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAssessmentDetails;
