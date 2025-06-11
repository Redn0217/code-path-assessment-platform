
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, TrendingUp, Mail, User, Clock, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AssessmentAnalytics from './AssessmentAnalytics';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  assessment_count?: number;
  last_assessment?: string;
  avatar_url?: string;
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

interface UserDetailsProps {
  user: User;
  onBack: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onBack }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Fetch user's assessments
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['user-assessments', user.id],
    queryFn: async () => {
      console.log('Fetching assessments for user:', user.id);
      
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user assessments:', error);
        throw error;
      }

      console.log('Fetched assessments:', data?.length || 0);
      return data || [];
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssessmentClick = (assessment: any) => {
    // Transform the Supabase assessment data to match our Assessment interface
    const transformedAssessment: Assessment = {
      id: assessment.id,
      domain: assessment.domain,
      module_id: assessment.module_id,
      difficulty: assessment.difficulty,
      score: assessment.score,
      total_questions: assessment.total_questions,
      completed_at: assessment.completed_at,
      time_taken: assessment.time_taken,
      strong_areas: assessment.strong_areas || [],
      weak_areas: assessment.weak_areas || [],
      answers: Array.isArray(assessment.answers) ? assessment.answers : [],
      question_ids: assessment.question_ids || []
    };
    setSelectedAssessment(transformedAssessment);
  };

  if (selectedAssessment) {
    return (
      <AssessmentAnalytics
        assessment={selectedAssessment}
        user={user}
        onBack={() => setSelectedAssessment(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Button>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {user.full_name ? getInitials(user.full_name) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user.full_name || 'Unknown User'}</h2>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
                  <div className="text-sm text-gray-600">Total Assessments</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {assessments.length > 0 
                      ? Math.round(assessments.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / assessments.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(assessments.map(a => a.domain)).size}
                  </div>
                  <div className="text-sm text-gray-600">Domains</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.last_assessment 
                      ? formatDistanceToNow(new Date(user.last_assessment), { addSuffix: true })
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Last Active</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No assessments completed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAssessmentClick(assessment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold capitalize">{assessment.domain}</h3>
                          <Badge className={getDifficultyColor(assessment.difficulty)}>
                            {assessment.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            <span className={getScoreColor(assessment.score, assessment.total_questions)}>
                              {assessment.score}/{assessment.total_questions} ({Math.round((assessment.score / assessment.total_questions) * 100)}%)
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(assessment.completed_at), { addSuffix: true })}</span>
                          </div>
                          {assessment.time_taken && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(assessment.time_taken / 60)} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
