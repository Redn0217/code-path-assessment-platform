import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import AssessmentView from './AssessmentView';

const domainsConstant = [
  { id: 'python', name: 'Python', color: 'bg-blue-500' },
  { id: 'devops', name: 'DevOps', color: 'bg-green-500' },
  { id: 'cloud', name: 'Cloud Computing', color: 'bg-sky-500' },
  { id: 'linux', name: 'Linux', color: 'bg-orange-500' },
  { id: 'networking', name: 'Networking', color: 'bg-purple-500' },
  { id: 'storage', name: 'Storage', color: 'bg-indigo-500' },
  { id: 'virtualization', name: 'Virtualization', color: 'bg-pink-500' },
  { id: 'object-storage', name: 'Object Storage', color: 'bg-cyan-500' },
  { id: 'ai-ml', name: 'AI & ML', color: 'bg-red-500' },
  { id: 'data-security', name: 'Data Security', color: 'bg-emerald-500' },
  { id: 'data-science', name: 'Data Science', color: 'bg-violet-500' }
];

const onStartAssessment = (domain: any, difficulty: string) => {
  console.log(`Starting assessment for ${domain.name} at ${difficulty} difficulty`);
};

interface AssessmentResults {
  domain: string;
  difficulty: string;
  score: number;
  date: string;
}

const samplePreviousAssessments: AssessmentResults[] = [
  { domain: 'Python', difficulty: 'Intermediate', score: 78, date: '2024-07-15' },
  { domain: 'DevOps', difficulty: 'Beginner', score: 92, date: '2024-07-10' },
  { domain: 'Cloud Computing', difficulty: 'Advanced', score: 65, date: '2024-07-01' },
];

const AssessmentDashboard = ({ domains, onStartAssessment }: { domains: any[]; onStartAssessment: (domain: any, difficulty: string) => void }) => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  
  // Fetch actual question count from database for the selected domain
  const { data: questionCount } = useQuery({
    queryKey: ['question-count', selectedDomain?.id],
    queryFn: async () => {
      if (!selectedDomain) return 0;
      
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('domain', selectedDomain.id);
      
      if (error) {
        console.error('Error fetching question count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!selectedDomain,
  });

  // Fetch assessment configuration for time settings
  const { data: assessmentConfig } = useQuery({
    queryKey: ['assessment-config', selectedDomain?.id],
    queryFn: async () => {
      if (!selectedDomain) return null;
      
      const { data, error } = await supabase
        .from('assessment_configs')
        .select('*')
        .eq('domain', selectedDomain.id)
        .single();
      
      if (error) {
        console.error('No assessment config found, using defaults');
        return { total_time_minutes: 45 }; // Default config
      }
      
      return data;
    },
    enabled: !!selectedDomain,
  });

  const totalTimeMinutes = assessmentConfig?.total_time_minutes || 45;
  
  const previousAssessments = samplePreviousAssessments;

  const handleStartAssessment = () => {
    if (selectedDomain) {
      onStartAssessment(selectedDomain, selectedDifficulty);
      setIsAssessmentStarted(true);
    }
  };

  if (isAssessmentStarted && selectedDomain) {
    return (
      <AssessmentView
        domain={selectedDomain}
        difficulty={selectedDifficulty}
        onComplete={() => setIsAssessmentStarted(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Assessment Dashboard</h1>
          <p className="text-gray-600">Evaluate your technical skills across various domains</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assessment Selection Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Start New Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Domain
                  </label>
                  <Select value={selectedDomain?.id || ''} onValueChange={(value) => {
                    const domain = domains.find(d => d.id === value);
                    setSelectedDomain(domain);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technical domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${domain.color}`}></div>
                            <span>{domain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Difficulty Level
                  </label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-red-100 text-red-800">Advanced</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic assessment preview */}
                {selectedDomain && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-blue-800">Assessment Details</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{questionCount || 0}</div>
                        <div className="text-blue-700">Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{totalTimeMinutes}</div>
                        <div className="text-blue-700">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">Mixed</div>
                        <div className="text-blue-700">Types</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600">
                      All available questions from {selectedDomain.name} domain will be included
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedDomain || (questionCount === 0)}
                  onClick={handleStartAssessment}
                >
                  {selectedDomain && questionCount === 0 ? 'No Questions Available' : 'Start Assessment'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Assessment History and Stats Sidebar */}
          <div>
            {/* Key Stats Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Key Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Assessments Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">82%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Previous Assessments Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Previous Assessments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previousAssessments.map((assessment, index) => (
                  <div key={index} className="border-b pb-2 last:border-none">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{assessment.domain}</div>
                        <div className="text-sm text-gray-600">{assessment.difficulty} Difficulty</div>
                      </div>
                      <div className="text-lg font-bold text-gray-700">{assessment.score}%</div>
                    </div>
                    <div className="text-xs text-gray-500">Taken on {assessment.date}</div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
