
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminStatsProps {
  selectedModule?: any;
}

const AdminStats: React.FC<AdminStatsProps> = ({ selectedModule }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['module-admin-stats', selectedModule?.id],
    queryFn: async () => {
      // Questions by type for this module
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('question_type, difficulty')
        .eq('module_id', selectedModule.id);
      
      if (questionsError) throw questionsError;

      // Assessments for this module
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('score, completed_at')
        .eq('module_id', selectedModule.id);
      
      if (assessmentsError) throw assessmentsError;

      // Process questions by type
      const questionsByType = questions.reduce((acc, q) => {
        acc[q.question_type] = (acc[q.question_type] || 0) + 1;
        return acc;
      }, {});

      // Process questions by difficulty
      const questionsByDifficulty = questions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {});

      // Calculate assessment stats
      const totalAssessments = assessments.length;
      const averageScore = assessments.length ? 
        Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length) : 0;

      return {
        totalQuestions: questions.length,
        totalAssessments,
        averageScore,
        questionsByType: Object.entries(questionsByType).map(([type, count]) => ({
          name: type.toUpperCase(),
          value: count,
        })),
        questionsByDifficulty: Object.entries(questionsByDifficulty).map(([difficulty, count]) => ({
          name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          value: count,
        })),
        recentAssessments: assessments
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          .slice(0, 10)
      };
    },
    enabled: !!selectedModule?.id,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center p-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Module: {selectedModule?.name}</Badge>
            <Badge variant="outline">Domain: {selectedModule?.domain}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Questions in this module
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              Completed assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Module performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.questionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.questionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.questionsByDifficulty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentAssessments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assessments completed yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAssessments.map((assessment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {new Date(assessment.completed_at).toLocaleDateString()}
                  </span>
                  <Badge variant={assessment.score >= 80 ? 'default' : assessment.score >= 60 ? 'secondary' : 'destructive'}>
                    {assessment.score}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
