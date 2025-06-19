
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import UserAssessmentDetails from './UserAssessmentDetails';

interface AssessmentData {
  id: string;
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

const UserPerformance = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);

  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['user-performance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch from both user_attempts and user_mastery_attempts
      const [practiceAttempts, masteryAttempts] = await Promise.all([
        supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false }),
        supabase
          .from('user_mastery_attempts')
          .select(`
            *,
            mastery_assessments (
              title,
              difficulty,
              domains,
              total_questions,
              time_limit_minutes
            )
          `)
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
      ]);

      const practice: AssessmentData[] = practiceAttempts.data?.map(attempt => ({
        id: attempt.id,
        assessment_type: 'practice' as const,
        assessment_title: `${attempt.domain} Assessment`,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        score: attempt.score,
        total_questions: attempt.total_questions,
        completed_at: attempt.completed_at,
        time_taken: attempt.time_taken,
        difficulty: attempt.difficulty,
        domain: attempt.domain,
        strong_areas: attempt.strong_areas,
        weak_areas: attempt.weak_areas,
        answers: attempt.answers,
        question_ids: attempt.question_ids
      })) || [];

      const mastery: AssessmentData[] = masteryAttempts.data?.map(attempt => ({
        id: attempt.id,
        assessment_type: 'mastery' as const,
        assessment_title: (attempt.mastery_assessments as any)?.title || 'Unknown Assessment',
        percentage: attempt.score ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
        score: attempt.score || 0,
        total_questions: attempt.total_questions,
        completed_at: attempt.completed_at,
        time_taken: attempt.time_taken,
        domains: (attempt.mastery_assessments as any)?.domains,
        difficulty: (attempt.mastery_assessments as any)?.difficulty,
        answers: attempt.answers,
        question_ids: attempt.question_ids
      })) || [];

      return [...practice, ...mastery].sort((a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
    },
  });

  const handleAssessmentClick = (assessment: AssessmentData) => {
    setSelectedAssessment(assessment);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 60) return <Target className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading your performance data...</div>;
  }

  if (selectedAssessment) {
    return (
      <UserAssessmentDetails
        assessment={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Your Performance Overview</h3>
        <p className="text-gray-600">Track your progress across all assessments</p>
      </div>

      {performanceData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assessments completed yet.</p>
            <p className="text-sm text-gray-400 mt-2">Start taking assessments to see your performance here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performanceData.map((assessment, index) => (
            <Card
              key={`${assessment.assessment_type}-${assessment.id}-${index}`}
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleAssessmentClick(assessment)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{assessment.assessment_title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={assessment.assessment_type === 'mastery' ? 'default' : 'secondary'}>
                        {assessment.assessment_type === 'mastery' ? 'Mastery Assessment' : 'Practice Assessment'}
                      </Badge>
                      {assessment.difficulty && (
                        <Badge className={getDifficultyColor(assessment.difficulty)}>
                          {assessment.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPerformanceIcon(assessment.percentage)}
                    <span className={`text-2xl font-bold ${getPerformanceColor(assessment.percentage)}`}>
                      {assessment.percentage}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">
                      {assessment.score} / {assessment.total_questions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date Taken:</span>
                    <span className="font-medium">
                      {format(new Date(assessment.completed_at), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {assessment.time_taken && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(assessment.time_taken / 60)} min
                      </span>
                    </div>
                  )}

                  {assessment.domains && Array.isArray(assessment.domains) && (
                    <div className="text-sm">
                      <span className="text-gray-600">Domains: </span>
                      <span className="font-medium">{assessment.domains.join(', ')}</span>
                    </div>
                  )}

                  {assessment.domain && assessment.assessment_type === 'practice' && (
                    <div className="text-sm">
                      <span className="text-gray-600">Domain: </span>
                      <span className="font-medium">{assessment.domain}</span>
                    </div>
                  )}

                  {assessment.strong_areas && assessment.strong_areas.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Strengths: </span>
                      <span className="text-green-600 font-medium">
                        {assessment.strong_areas.join(', ')}
                      </span>
                    </div>
                  )}

                  {assessment.weak_areas && assessment.weak_areas.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Areas for improvement: </span>
                      <span className="text-red-600 font-medium">
                        {assessment.weak_areas.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPerformance;
