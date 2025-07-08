
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Lightbulb, Dumbbell, GraduationCap, Trophy, BarChart3 } from 'lucide-react';
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
      <div className="min-h-screen bright-bg-primary">
        {/* Modern Sticky Header */}
        <header className="modern-navbar sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="evalu8 Logo" className="h-8 w-auto navbar-logo" />
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button
                  onClick={() => navigate('/auth')}
                  className="navbar-button bright-button-primary"
                >
                  Login / Register
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Animated Hero Section */}
        <section className="animated-hero-bg py-32 relative">
          {/* Floating Code Particles */}
          <div className="code-particles">
            <div className="particle">{'<html>'}</div>
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
            <h2 className="fahkwang-title text-6xl font-bold bright-text-primary mb-6 drop-shadow-lg">
              Comprehensive Technical Assessment Platform
            </h2>
            <p className="text-xl bright-text-primary mb-8 max-w-4xl mx-auto drop-shadow-md">
              <Rocket className="inline h-5 w-5 mr-2 text-green-600" />
              Evaluate your skills across multiple technology domains with interactive coding challenges,
              detailed reports, and personalized improvement suggestions.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 bright-text-secondary text-lg mb-8">
              <div className="flex items-center space-x-2 bg-gray-100/60 px-4 py-2 rounded-full font-light">
                <Target className="h-5 w-5 text-green-600" />
                <span className="bright-text-accent-green">Interactive Challenges</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100/60 px-4 py-2 rounded-full font-light">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Detailed Analytics</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100/60 px-4 py-2 rounded-full font-light">
                <Target className="h-5 w-5 text-green-600" />
                <span className="bright-text-accent-green">Skill Improvement</span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bright-button-primary text-xl px-12 py-4 rounded-full shadow-2xl pulse-animation font-bold"
            >
              🚀 Start Your Assessment Journey
            </Button>
          </div>
        </section>

        {/* Enhanced Features Section - Bright Green/Orange Theme */}
        <section className="py-20 bright-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="fahkwang-title text-4xl font-bold bright-text-primary mb-4">
                Platform Features
              </h3>
              <p className="text-xl bright-text-secondary max-w-2xl mx-auto">
                Discover powerful tools designed to accelerate your coding journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bright-card">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-green-100 to-gray-100 rounded-full">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl bright-text-accent-green fahkwang-title">Practice Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-center bright-text-secondary">
                    Practice with individual domain assessments. Take unlimited attempts to improve your skills in specific areas.
                    <div className="mt-4 flex justify-center space-x-4 text-sm font-medium">
                      <span className="flex items-center space-x-1 text-green-600">
                        <Target className="h-4 w-4" />
                        <span>Unlimited attempts</span>
                      </span>
                      <span className="flex items-center space-x-1 text-gray-600">
                        <BarChart3 className="h-4 w-4" />
                        <span>Multiple domains</span>
                      </span>
                      <span className="flex items-center space-x-1 text-green-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>Skill building</span>
                      </span>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bright-card">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-gray-100 to-green-100 rounded-full">
                      <Trophy className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-gray-600 fahkwang-title">Mastery Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-center bright-text-secondary">
                    Take comprehensive one-time certification assessments that test multiple domains simultaneously.
                    <div className="mt-4 flex justify-center space-x-4 text-sm font-medium">
                      <span className="flex items-center space-x-1 text-gray-600">
                        <Trophy className="h-4 w-4" />
                        <span>Certification ready</span>
                      </span>
                      <span className="flex items-center space-x-1 text-green-600">
                        <Target className="h-4 w-4" />
                        <span>Comprehensive testing</span>
                      </span>
                      <span className="flex items-center space-x-1 text-gray-600">
                        <BarChart3 className="h-4 w-4" />
                        <span>Detailed reports</span>
                      </span>
                    </div>
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
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
              <UserPerformance />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </AuthenticatedLayout>
  );
};

export default Index;
