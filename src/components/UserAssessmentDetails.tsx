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
  // Debug: Log the assessment data received
  console.log('UserAssessmentDetails: Received assessment data:', assessment);
  console.log('UserAssessmentDetails: Assessment answers:', assessment.answers);
  console.log('UserAssessmentDetails: Assessment answers type:', typeof assessment.answers);
  console.log('UserAssessmentDetails: Assessment answers is array:', Array.isArray(assessment.answers));
  console.log('UserAssessmentDetails: Question IDs:', assessment.question_ids);
  console.log('UserAssessmentDetails: Question IDs type:', typeof assessment.question_ids);
  console.log('UserAssessmentDetails: Question IDs is array:', Array.isArray(assessment.question_ids));
  console.log('UserAssessmentDetails: Question IDs length:', assessment.question_ids?.length);

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
          .order('created_at', { ascending: false }); // Match the order used during assessment

        if (error) {
          console.error('Error fetching mastery questions:', error);
          return [];
        }

        console.log('UserAssessmentDetails: Fetched mastery questions:', data?.length || 0);
        console.log('UserAssessmentDetails: Question order (first 3):', data?.slice(0, 3).map(q => ({ id: q.id, title: q.title })));
        return data || [];
      } else {
        // For regular assessments, fetch from questions table
        console.log('UserAssessmentDetails: Processing regular assessment questions:', {
          question_ids: assessment.question_ids,
          question_ids_type: typeof assessment.question_ids,
          question_ids_length: assessment.question_ids?.length,
          is_array: Array.isArray(assessment.question_ids)
        });

        // Ensure question_ids is an array (handle multiple possible formats)
        let questionIds = assessment.question_ids;

        console.log('UserAssessmentDetails: Raw question_ids:', questionIds);
        console.log('UserAssessmentDetails: Raw question_ids type:', typeof questionIds);

        // Handle different possible formats
        if (typeof questionIds === 'string') {
          try {
            questionIds = JSON.parse(questionIds);
            console.log('UserAssessmentDetails: Parsed question_ids from JSON string:', questionIds);
          } catch (e) {
            console.error('UserAssessmentDetails: Failed to parse question_ids string:', e);
            return [];
          }
        } else if (typeof questionIds === 'number') {
          console.error('UserAssessmentDetails: question_ids is a number (length), not an array:', questionIds);
          return [];
        } else if (!questionIds) {
          console.log('UserAssessmentDetails: question_ids is null/undefined');
          return [];
        }

        if (!Array.isArray(questionIds) || questionIds.length === 0) {
          console.log('UserAssessmentDetails: question_ids is not a valid array:', questionIds);
          return [];
        }

        console.log('UserAssessmentDetails: Using question_ids:', questionIds);

        // IMPORTANT: Practice assessments store question_bank IDs, not questions table IDs
        // This is because AssessmentGenerator uses question_bank_id as the main ID
        console.log('UserAssessmentDetails: Fetching directly from question_bank (practice assessments use question_bank IDs)...');

        const { data: bankData, error: bankError } = await supabase
          .from('question_bank')
          .select('id, title, question_text, difficulty, correct_answer, options, question_type')
          .in('id', questionIds);

        if (bankError) {
          console.error('UserAssessmentDetails: Error fetching from question_bank:', bankError);

          // Fallback: try to fetch from questions table (in case of old data)
          console.log('UserAssessmentDetails: Trying fallback to questions table...');
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select(`
              id,
              question_bank!inner(
                id,
                title,
                question_text,
                difficulty,
                correct_answer,
                options,
                question_type
              )
            `)
            .in('question_bank_id', questionIds); // Use question_bank_id for lookup

          if (questionsError) {
            console.error('UserAssessmentDetails: Fallback also failed:', questionsError);
            return [];
          }

          // Transform questions data to flatten the question_bank structure
          const transformedData = questionsData?.map(q => ({
            id: q.question_bank.id,
            title: q.question_bank.title,
            question_text: q.question_bank.question_text,
            difficulty: q.question_bank.difficulty,
            correct_answer: q.question_bank.correct_answer,
            options: q.question_bank.options,
            question_type: q.question_bank.question_type
          })) || [];

          console.log('UserAssessmentDetails: Fetched via fallback:', transformedData?.length || 0);

          // CRITICAL: Ensure questions are returned in the same order as question_ids
          const orderedFallbackQuestions = questionIds.map(id =>
            transformedData?.find(q => q.id === id)
          ).filter(Boolean);

          console.log('UserAssessmentDetails: Ordered fallback questions:', orderedFallbackQuestions?.length || 0);
          return orderedFallbackQuestions;
        }

        console.log('UserAssessmentDetails: Successfully fetched from question_bank:', bankData?.length || 0);

        // CRITICAL: Ensure questions are returned in the same order as question_ids
        // This is essential for correct answer mapping during analysis
        const orderedQuestions = questionIds.map(id =>
          bankData?.find(q => q.id === id)
        ).filter(Boolean); // Remove any undefined entries

        console.log('UserAssessmentDetails: Ordered questions:', orderedQuestions?.length || 0);
        console.log('UserAssessmentDetails: Question order check:', {
          questionIds: questionIds.slice(0, 3),
          orderedQuestionIds: orderedQuestions.slice(0, 3).map(q => q.id)
        });

        return orderedQuestions || [];
      }
    },
    enabled: (() => {
      if (assessment.assessment_type === 'mastery') {
        return true;
      }

      // For practice assessments, check if we have valid question_ids
      let questionIds = assessment.question_ids;
      if (typeof questionIds === 'string') {
        try {
          questionIds = JSON.parse(questionIds);
        } catch (e) {
          return false;
        }
      }

      const isEnabled = Array.isArray(questionIds) && questionIds.length > 0;
      console.log('UserAssessmentDetails: Query enabled check:', {
        assessment_type: assessment.assessment_type,
        question_ids: assessment.question_ids,
        parsed_question_ids: questionIds,
        question_ids_length: Array.isArray(questionIds) ? questionIds.length : 'not array',
        isEnabled
      });
      return isEnabled;
    })(),
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
    // Both mastery and regular assessments store answers as arrays
    const userAnswer = assessment.answers?.[index];

    console.log(`UserAssessmentDetails: Question ${index + 1} analysis:`, {
      questionId: question.id,
      userAnswer,
      userAnswerType: typeof userAnswer,
      correctAnswer: question.correct_answer,
      hasOptions: !!question.options,
      options: question.options,
      assessmentType: assessment.assessment_type,
      answersType: typeof assessment.answers,
      isAnswersArray: Array.isArray(assessment.answers),
      answersLength: Array.isArray(assessment.answers) ? assessment.answers.length : 'not array',
      rawAnswers: assessment.answers
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
                        <div className="font-medium">
                          Your Answer: <span className={analysis.isCorrect ? "text-green-600" : "text-red-600"}>
                            {typeof analysis.userAnswer === 'number' && analysis.question.options[analysis.userAnswer]
                              ? analysis.question.options[analysis.userAnswer]
                              : analysis.userAnswer !== undefined && analysis.userAnswer !== null && analysis.userAnswer !== ''
                              ? analysis.userAnswer.toString()
                              : 'No answer provided'}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Non-MCQ Question (Coding, Scenario)
                      <>
                        <div className="font-medium">
                          Correct Answer: <span className="text-green-600">{analysis.question.correct_answer}</span>
                        </div>
                        <div className="font-medium">
                          Your Answer: <span className={analysis.isCorrect ? "text-green-600" : "text-red-600"}>
                            {analysis.userAnswer !== undefined && analysis.userAnswer !== null
                              ? analysis.userAnswer.toString()
                              : 'No answer provided'}
                          </span>
                        </div>
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
                <p>Question IDs: {Array.isArray(assessment.question_ids) ? assessment.question_ids.length : typeof assessment.question_ids}</p>
                <p>Question IDs Raw: {JSON.stringify(assessment.question_ids)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAssessmentDetails;
