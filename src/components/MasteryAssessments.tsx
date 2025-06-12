
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MasteryAssessments = () => {
  const { toast } = useToast();

  // Fetch mastery assessments
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['mastery-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastery_assessments')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's attempts
  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-mastery-attempts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleStartAssessment = async (assessment: any) => {
    const existingAttempt = userAttempts.find(
      attempt => attempt.mastery_assessment_id === assessment.id
    );
    
    if (existingAttempt) {
      toast({
        title: "Assessment Already Taken",
        description: "You have already completed this mastery assessment.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Navigate to assessment taking page
    toast({
      title: "Starting Assessment",
      description: `Starting ${assessment.title}...`,
    });
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
    return <div className="flex justify-center p-8">Loading mastery assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Mastery Assessments</h3>
        <p className="text-gray-600">One-time comprehensive assessments for certification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const userAttempt = userAttempts.find(
            attempt => attempt.mastery_assessment_id === assessment.id
          );
          const isCompleted = !!userAttempt;

          return (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{assessment.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(assessment.difficulty)}>
                      {assessment.difficulty}
                    </Badge>
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {assessment.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{assessment.total_questions} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{assessment.time_limit_minutes} min</span>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userAttempt.score}%
                      </div>
                      <div className="text-sm text-gray-500">Your Score</div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Assessment Completed
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartAssessment(assessment)}
                  >
                    Start Assessment
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No mastery assessments available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MasteryAssessments;
