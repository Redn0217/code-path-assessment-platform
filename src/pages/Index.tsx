
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Lightbulb, Dumbbell, GraduationCap, Trophy, BarChart3, Zap, Users, Award } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ParticleTextEffect } from '@/components/ui/ParticleTextEffect';

import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PracticeHub from '@/components/PracticeHub';
import MasteryAssessments from '@/components/MasteryAssessments';
import NewUserPerformance from '@/components/NewUserPerformance';
import UserPerformance from '@/components/UserPerformance';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="evalu8 Logo" className="h-8 w-auto" />
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button onClick={() => navigate('/auth')}>
                  Login / Register
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Interactive Hero Section with Particle Effect */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                AI-Powered Learning Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Experience the future of education with our comprehensive assessment platform. 
                Master skills through interactive challenges, AI-powered interviews, and personalized learning paths.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-3">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Learning Today
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  <Target className="mr-2 h-5 w-5" />
                  Explore Features
                </Button>
              </div>
            </div>

            {/* Particle Text Effect */}
            <div className="mb-16">
              <ParticleTextEffect words={["evalu8", "AI-Powered", "Learning", "Assessment", "Innovation"]} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Platform Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover powerful tools designed to accelerate your learning journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Practice Hub */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Practice Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Practice with individual domain assessments. Take unlimited attempts to improve your skills in specific areas.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Unlimited attempts</span>
                    <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-xs rounded-full">Multiple domains</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full">Skill building</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Interviews */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">AI Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Prepare for real interviews with AI-powered mock sessions. Get instant feedback and improve your performance.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Real-time feedback</span>
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">Mock sessions</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Performance analytics</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mastery Assessments */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Mastery Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Take comprehensive certification assessments that test multiple domains simultaneously for career advancement.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-full">Certification</span>
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full">Comprehensive</span>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-xs rounded-full">Detailed reports</span>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Analytics */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dumbbell className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Smart Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Track your progress with detailed analytics and insights. Identify strengths and areas for improvement.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">Progress tracking</span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Insights</span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Performance metrics</span>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Hub */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Rocket className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Learning Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Access a comprehensive library of study materials, tutorials, and resources tailored to your learning path.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Study materials</span>
                    <span className="px-2 py-1 bg-pink-500/10 text-pink-500 text-xs rounded-full">Tutorials</span>
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Resources</span>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement System */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Award className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Achievement System</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Earn badges and achievements as you progress. Celebrate milestones and showcase your accomplishments.
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Badges</span>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">Milestones</span>
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full">Achievements</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of learners who are already advancing their careers with our AI-powered platform.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-3 text-lg">
              Get Started Free
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Hero Section for Authenticated Users */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Welcome to Your Assessment Dashboard
          </h2>
          <div className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 font-light tracking-wide">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Master your coding skills</span>
              </div>
              <div className="flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span>Boost your confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Unlock your potential</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose between practice sessions for specific domains, comprehensive mastery assessments, or check your performance history.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-full">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span>Challenge Yourself</span>
            </div>
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-full">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Learn & Grow</span>
            </div>
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-full">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Achieve Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Interactive Learning Experience</h3>
            <p className="text-muted-foreground">Watch the dynamic text effect showcasing our platform capabilities</p>
          </div>
          <ParticleTextEffect words={["Welcome", "Practice", "Master", "Achieve", "Excel"]} />
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Choose Your Path</h3>
            <p className="text-muted-foreground">Select the learning experience that fits your goals</p>
          </div>
          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12">
              <TabsTrigger value="practice" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Practice Hub</span>
              </TabsTrigger>
              <TabsTrigger value="mastery" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Mastery Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="practice">
              <PracticeHub />
            </TabsContent>
            
            <TabsContent value="mastery">
              <MasteryAssessments />
            </TabsContent>

            <TabsContent value="performance">
              <Tabs defaultValue="assessments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
                  <TabsTrigger value="assessments">Assessment History</TabsTrigger>
                  <TabsTrigger value="features">Enhanced Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="assessments">
                  <UserPerformance />
                </TabsContent>
                
                <TabsContent value="features">
                  <NewUserPerformance />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </AuthenticatedLayout>
  );
};

export default Index;
