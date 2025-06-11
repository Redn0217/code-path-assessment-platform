import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AssessmentView from './AssessmentView';

const AssessmentDashboard = ({ user, domains, onLogout }) => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  
  // Fetch assessment configuration for the selected domain
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
        console.error('Error fetching assessment config:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedDomain,
  });

  // Calculate total questions from config
  const totalQuestions = assessmentConfig 
    ? (assessmentConfig.mcq_count || 0) + (assessmentConfig.coding_count || 0) + (assessmentConfig.scenario_count || 0)
    : 0;

  const totalTimeMinutes = assessmentConfig?.total_time_minutes || 60;
  
  // Mock data for previous assessments
  const previousAssessments = [
    { 
      id: 1, 
      domain: 'Python', 
      score: 82, 
      date: '2023-05-15', 
      difficulty: 'Intermediate',
      completed: true,
      strongAreas: ['Data Structures', 'File Handling'],
      weakAreas: ['Object-Oriented Programming']
    },
    { 
      id: 2, 
      domain: 'DevOps', 
      score: 68, 
      date: '2023-06-02', 
      difficulty: 'Intermediate',
      completed: true,
      strongAreas: ['Docker', 'CI/CD'],
      weakAreas: ['Kubernetes', 'Infrastructure as Code']
    },
    { 
      id: 3, 
      domain: 'Linux', 
      score: 75, 
      date: '2023-06-20', 
      difficulty: 'Beginner',
      completed: true,
      strongAreas: ['Basic Commands', 'File System'],
      weakAreas: ['Shell Scripting']
    },
  ];

  const handleStartAssessment = () => {
    if (!selectedDomain) return;
    setIsAssessmentStarted(true);
  };

  const handleEndAssessment = () => {
    setIsAssessmentStarted(false);
    setSelectedDomain(null);
  };

  if (isAssessmentStarted && selectedDomain) {
    return (
      <AssessmentView 
        domain={selectedDomain} 
        difficulty={selectedDifficulty}
        onComplete={handleEndAssessment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with user info */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">TechAssess Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - User profile */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Assessment Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Completed</span>
                      <Badge variant="outline">{previousAssessments.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg. Score</span>
                      <Badge variant="outline">
                        {Math.round(previousAssessments.reduce((acc, curr) => acc + curr.score, 0) / previousAssessments.length)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last Assessment</span>
                      <Badge variant="outline">{previousAssessments[0]?.date || 'N/A'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Start New Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Select Domain</Label>
                  <Select 
                    onValueChange={(value) => {
                      const domain = domains.find(d => d.id === value);
                      setSelectedDomain(domain);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technology domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map(domain => (
                        <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select defaultValue="intermediate" onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic assessment preview */}
                {selectedDomain && assessmentConfig && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-blue-800">Assessment Details</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{totalQuestions}</div>
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
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>• MCQ: {assessmentConfig.mcq_count}</div>
                      <div>• Coding: {assessmentConfig.coding_count}</div>
                      <div>• Scenario: {assessmentConfig.scenario_count}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedDomain || totalQuestions === 0}
                  onClick={handleStartAssessment}
                >
                  {selectedDomain && totalQuestions === 0 ? 'No Questions Available' : 'Start Assessment'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content - Assessments */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="history">
              <TabsList className="mb-4">
                <TabsTrigger value="history">Assessment History</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Your Previous Assessments</h2>
                  
                  {previousAssessments.length > 0 ? (
                    previousAssessments.map((assessment) => (
                      <Card key={assessment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{assessment.domain} Assessment</CardTitle>
                            <Badge>{assessment.difficulty}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Score: {assessment.score}%</span>
                                <span className="text-sm text-gray-500">{assessment.date}</span>
                              </div>
                              <Progress value={assessment.score} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Strong Areas</h4>
                                <div className="flex flex-wrap gap-1">
                                  {assessment.strongAreas.map((area, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Weak Areas</h4>
                                <div className="flex flex-wrap gap-1">
                                  {assessment.weakAreas.map((area, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="w-full flex justify-between">
                            <Button variant="outline" size="sm">View Details</Button>
                            <Button variant="outline" size="sm">Download Report</Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-gray-500">You haven't completed any assessments yet.</p>
                        <p className="text-gray-500 mt-2">Select a domain and start your first assessment!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Learning Recommendations</h2>
                  
                  {previousAssessments.length > 0 ? (
                    <div className="space-y-4">
                      {previousAssessments.map(assessment => (
                        <Card key={`rec-${assessment.id}`}>
                          <CardHeader>
                            <CardTitle className="text-lg">Improve Your {assessment.domain} Skills</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Based on your assessment score of {assessment.score}%, we recommend focusing on these areas:
                            </p>
                            
                            {assessment.weakAreas.map((area, idx) => (
                              <div key={idx} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2">{area}</h4>
                                <div className="text-sm text-gray-600">
                                  <p className="mb-2">Recommended resources:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    <li>Online course: "Mastering {area}"</li>
                                    <li>Practice exercises on our platform</li>
                                    <li>Read the documentation at example.com/{area.toLowerCase().replace(' ', '-')}</li>
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                          <CardFooter>
                            <Button size="sm">View Detailed Learning Plan</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-gray-500">Complete at least one assessment to get personalized recommendations.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentDashboard;
