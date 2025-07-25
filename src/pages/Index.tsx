
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Lightbulb, Dumbbell, GraduationCap, Trophy, BarChart3, Zap, Users, Award } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ParticleTextEffect } from '@/components/ui/ParticleTextEffect';
import { AnimatedFooter } from '@/components/ui/animated-footer';
import { SplineSceneBasic } from '@/components/ui/spline-demo';

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
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
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

  useEffect(() => {
    // Handle scroll to hide arrow with smoother transition
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <header className="modern-navbar sticky top-0 z-50 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="evalu8 Logo" className="h-8 w-auto navbar-logo cursor-pointer" />
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
        <section className="py-8 bg-gradient-to-b from-background to-muted/20 relative">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-full">
            <div className="flex items-center justify-center min-h-[80vh]">
              {/* Particle Text Effect */}
              <ParticleTextEffect words={["evalu8", "AI-Powered", "Practice", "Assessment", "Innovation"]} />
            </div>

            {/* Animated Scroll Down Arrow */}
            <div
              className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-50 transition-opacity duration-500 ease-out ${
                showScrollArrow
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
              style={{
                animation: showScrollArrow ? 'slowBounce 2s ease-in-out infinite' : 'none'
              }}
            >
              <div className="w-5 h-8 border-2 border-muted-foreground rounded-full flex justify-center">
                <div className="w-1 h-2 bg-muted-foreground rounded-full mt-1.5 animate-pulse"></div>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
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

            {/* First row - Practice Hub and Mastery Assessments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
            </div>

            {/* Featured AI Interviews Section - Larger and more prominent */}
            <div className="mb-8">
              <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          AI Interviews
                        </CardTitle>
                        <p className="text-blue-600/70 dark:text-blue-400/70 font-medium mt-1">
                          Next-Generation Interview Preparation
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                      <Lightbulb className="h-6 w-6 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <CardDescription className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        Prepare for real interviews with AI-powered mock sessions. Get instant feedback,
                        improve your performance, and build confidence with our advanced interview simulation platform.
                      </CardDescription>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <span className="px-3 py-2 bg-blue-500/15 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700">
                          Real-time feedback
                        </span>
                        <span className="px-3 py-2 bg-green-500/15 text-green-700 dark:text-green-300 text-sm font-medium rounded-full border border-green-200 dark:border-green-700">
                          Mock sessions
                        </span>
                        <span className="px-3 py-2 bg-purple-500/15 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full border border-purple-200 dark:border-purple-700">
                          Performance analytics
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">AI-powered question generation</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Voice and video analysis</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Personalized improvement plans</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => navigate('/ai-interviewer')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Explore AI Interviewer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Other Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* 3D Integration Showcase */}
        <section className="py-20 bg-background">
          {/* Header Section - Contained */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Interactive 3D Experience
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the future of web development with our integrated 3D components.
                Built with modern technologies including shadcn/ui, Tailwind CSS, and TypeScript.
              </p>
            </div>
          </div>

          {/* 3D Demo Component - With Larger Edge Gap */}
          <div className="px-8 mb-16">
            <SplineSceneBasic />
          </div>

          {/* Technical Implementation Details - Contained */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span>shadcn/ui Structure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Components organized in <code>/components/ui</code> folder following shadcn conventions.
                    Proper TypeScript interfaces and reusable component architecture.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <svg className="h-5 w-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <span>Tailwind CSS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Utility-first CSS framework with custom animations, responsive design,
                    and consistent design tokens. Dark/light mode support included.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span>TypeScript</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Full type safety with proper interfaces, props validation,
                    and IntelliSense support. Enhanced developer experience and code reliability.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Guide */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Implementation Guide</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Project Setup Requirements</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>shadcn/ui project structure ✓</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Tailwind CSS configured ✓</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>TypeScript support ✓</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>/components/ui folder structure ✓</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Dependencies Installed</h4>
                  <div className="bg-background rounded-lg p-4">
                    <code className="text-sm text-muted-foreground">
                      npm install @splinetool/runtime<br/>
                      npm install @splinetool/react-spline<br/>
                      npm install framer-motion
                    </code>
                  </div>
                </div>
              </div>
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

        {/* Animated Footer */}
        <AnimatedFooter />
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
