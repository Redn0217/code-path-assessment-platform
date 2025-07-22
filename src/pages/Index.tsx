
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Lightbulb, Dumbbell, GraduationCap, Trophy, BarChart3, Brain, Zap, Star, Users, BookOpen, PlayCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Modern Glassmorphic Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="evalu8 Logo" className="h-6 w-auto" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  evalu8
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
                <Star className="h-4 w-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Master Your Skills with
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                  Smart Assessments
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in">
                Experience the future of learning with our AI-powered platform. Take interactive tests, 
                get personalized feedback, and accelerate your professional growth with cutting-edge technology.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl px-8 py-4 text-lg font-semibold group"
                >
                  Start Free Assessment
                  <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 hover:bg-primary/5 rounded-xl px-8 py-4 text-lg font-semibold"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 dark:border-slate-700/50">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 dark:border-slate-700/50">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Real-time Feedback</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 dark:border-slate-700/50">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">10K+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Everything You Need to Excel
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed for learners, professionals, and educators
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Practice Hub */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">Practice Hub</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Master individual skills with unlimited practice sessions. Get instant feedback and track your progress.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">Unlimited Attempts</span>
                    <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">Multi-Domain</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Interviews */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">AI Interviews</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Practice with AI-powered mock interviews. Get real-time feedback and performance analytics.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">AI-Powered</span>
                    <span className="bg-pink-500/10 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">Real-time</span>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Hub */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">Learning Hub</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Access curated learning materials, videos, and interactive modules tailored to your needs.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-medium">Personalized</span>
                    <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium">Interactive</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mastery Assessments */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">Mastery Assessments</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Comprehensive certification tests that evaluate your expertise across multiple domains.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">Certification</span>
                    <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-xs font-medium">Comprehensive</span>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">Smart Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Detailed performance insights with personalized recommendations for improvement.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">Insights</span>
                    <span className="bg-cyan-500/10 text-cyan-600 px-3 py-1 rounded-full text-xs font-medium">Detailed</span>
                  </div>
                </CardContent>
              </Card>

              {/* Gamification */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed mb-6">
                    Earn badges, track streaks, and unlock achievements as you progress through your learning journey.
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">Badges</span>
                    <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">Streaks</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary via-blue-600 to-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are already advancing their careers with our AI-powered platform.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl px-8 py-4 text-lg font-semibold"
            >
              Start Your Journey Today
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Animated Hero Section */}
      <section className="animated-hero-bg py-20 relative">
        {/* Floating Code Particles */}
        <div className="code-particles">
          <div className="particle">{'<code>'}</div>
          <div className="particle">{'function()'}</div>
          <div className="particle">{'{ }'}</div>
          <div className="particle">{'console.log()'}</div>
          <div className="particle">{'=> {}'}</div>
          <div className="particle">{'class'}</div>
          <div className="particle">{'import'}</div>
          <div className="particle">{'const'}</div>
          <div className="particle">{'return'}</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="fahkwang-title text-5xl font-bold bright-text-primary mb-6 drop-shadow-lg">
            Welcome to Your Assessment Dashboard
          </h2>
          <div className="text-xl bright-text-primary mb-8 max-w-4xl mx-auto drop-shadow-md">
            <div className="flex flex-wrap items-center justify-center gap-6 font-light tracking-wide">
              <div className="flex items-center space-x-2 motivational-text">
                <Target className="h-5 w-5 text-green-600" />
                <span>Master your coding skills</span>
              </div>
              <div className="flex items-center space-x-2 motivational-text">
                <Rocket className="h-5 w-5 text-gray-600" />
                <span>Boost your confidence</span>
              </div>
              <div className="flex items-center space-x-2 motivational-text">
                <Lightbulb className="h-5 w-5 text-green-600" />
                <span>Unlock your potential</span>
              </div>
            </div>
          </div>
          <p className="text-lg bright-text-secondary mb-8 max-w-2xl mx-auto">
            Choose between practice sessions for specific domains, comprehensive mastery assessments, or check your performance history.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 bright-text-secondary text-sm">
            <div className="flex items-center space-x-2 bg-gray-100/60 px-3 py-2 rounded-full font-light">
              <Dumbbell className="h-4 w-4 text-green-600" />
              <span className="bright-text-accent-green">Challenge Yourself</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100/60 px-3 py-2 rounded-full font-light">
              <GraduationCap className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Learn & Grow</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100/60 px-3 py-2 rounded-full font-light">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="bright-text-accent-green">Achieve Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Tabs Section - Bright Green/Orange Theme */}
      <section className="py-12 bright-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="fahkwang-title text-2xl font-bold bright-text-primary mb-2">Choose Your Path</h3>
            <p className="bright-text-secondary">Select the learning experience that fits your goals</p>
          </div>
          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12 bright-bg-primary shadow-lg border border-gray-200/60">
              <TabsTrigger value="practice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/80 data-[state=active]:to-gray-400/80 data-[state=active]:text-white bright-text-secondary font-semibold flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Practice Hub</span>
              </TabsTrigger>
              <TabsTrigger value="mastery" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500/80 data-[state=active]:to-green-500/80 data-[state=active]:text-white bright-text-secondary font-semibold flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Mastery Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/80 data-[state=active]:to-gray-500/80 data-[state=active]:text-white bright-text-secondary font-semibold flex items-center space-x-2">
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
