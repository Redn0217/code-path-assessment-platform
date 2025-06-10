
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileQuestion, Users, BookOpen, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DomainCount {
  domain: string;
  count: number;
}

interface TypeCount {
  type: string;
  count: number;
}

interface DifficultyCount {
  difficulty: string;
  count: number;
}

interface AverageScore {
  domain: string;
  score: number;
}

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get questions count by domain
      const { data: questions } = await supabase
        .from('questions')
        .select('domain, question_type, difficulty');

      // Get assessments data
      const { data: assessments } = await supabase
        .from('assessments')
        .select('domain, score, difficulty, completed_at');

      // Get total users count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      // Process data
      const questionsByDomain: Record<string, number> = {};
      const questionsByType = { mcq: 0, coding: 0, scenario: 0 };
      const questionsByDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };

      questions?.forEach(q => {
        if (!questionsByDomain[q.domain]) questionsByDomain[q.domain] = 0;
        questionsByDomain[q.domain]++;
        if (q.question_type in questionsByType) {
          questionsByType[q.question_type as keyof typeof questionsByType]++;
        }
        if (q.difficulty in questionsByDifficulty) {
          questionsByDifficulty[q.difficulty as keyof typeof questionsByDifficulty]++;
        }
      });

      const assessmentsByDomain: Record<string, number> = {};
      const averageScores: Record<string, { total: number; count: number }> = {};
      let totalAssessments = 0;

      assessments?.forEach(a => {
        if (!assessmentsByDomain[a.domain]) assessmentsByDomain[a.domain] = 0;
        if (!averageScores[a.domain]) averageScores[a.domain] = { total: 0, count: 0 };
        
        assessmentsByDomain[a.domain]++;
        averageScores[a.domain].total += (a.score as number);
        averageScores[a.domain].count++;
        totalAssessments++;
      });

      // Calculate average scores
      const processedAverageScores: Record<string, number> = {};
      Object.keys(averageScores).forEach(domain => {
        processedAverageScores[domain] = Math.round(averageScores[domain].total / averageScores[domain].count);
      });

      return {
        totalQuestions: questions?.length || 0,
        totalUsers: profiles?.length || 0,
        totalAssessments,
        questionsByDomain: Object.entries(questionsByDomain).map(([domain, count]) => ({ domain, count })),
        questionsByType: Object.entries(questionsByType).map(([type, count]) => ({ type, count })),
        questionsByDifficulty: Object.entries(questionsByDifficulty).map(([difficulty, count]) => ({ difficulty, count })),
        assessmentsByDomain: Object.entries(assessmentsByDomain).map(([domain, count]) => ({ domain, count })),
        averageScores: Object.entries(processedAverageScores).map(([domain, score]) => ({ domain, score })),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssessments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageScores?.length ? 
                Math.round(stats.averageScores.reduce((sum: number, item: AverageScore) => sum + item.score, 0) / stats.averageScores.length) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.questionsByDomain}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.questionsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {stats?.questionsByType?.map((entry, index) => (
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
            <CardTitle>Average Scores by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.averageScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.questionsByDifficulty}
                  dataKey="count"
                  nameKey="difficulty"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {stats?.questionsByDifficulty?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.averageScores?.map(({ domain, score }: AverageScore) => (
              <div key={domain} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{domain}</Badge>
                  <span className="text-sm text-gray-600">
                    {stats.questionsByDomain.find((q: DomainCount) => q.domain === domain)?.count || 0} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Avg. Score:</span>
                  <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                    {score}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
