
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Rocket, Lightbulb, Dumbbell, GraduationCap, Trophy, BarChart3 } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PracticeHub from '@/components/PracticeHub';
import MasteryAssessments from '@/components/MasteryAssessments';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="geometric-bg">
          <div className="orb-bg orb-1"></div>
          <div className="orb-bg orb-2"></div>
          <div className="orb-bg orb-3"></div>
          <div className="orb-bg orb-4"></div>
          
          {/* Floating Shapes */}
          <div className="shape shape-circle w-16 h-16 top-[20%] left-[10%] animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="shape shape-square w-12 h-12 top-[70%] right-[15%] animate-drift" style={{ animationDelay: '2s' }}></div>
          <div className="shape shape-circle w-20 h-20 bottom-[30%] left-[20%] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
          <div className="shape shape-square w-8 h-8 top-[40%] right-[30%] animate-spin-slow"></div>
        </div>

        {/* Modern Glass Header */}
        <header className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3 animate-slide-in-left">
                <img src="/logo.png" alt="evalu8 Logo" className="h-10 w-auto hover:scale-110 transition-transform duration-300" />
                <span className="text-2xl font-bold gradient-text">evalu8</span>
              </div>
              <Button
                onClick={() => navigate('/auth')}
                className="modern-button px-8 py-2 rounded-full animate-slide-in-right"
              >
                🚀 Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section with Advanced Animations */}
        <section className="min-h-screen flex items-center justify-center relative pt-20">
          {/* Enhanced Code Particles */}
          <div className="code-particles">
            <div className="particle animate-fade-in-up" style={{ animationDelay: '0s' }}>{'<html>'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{'function()'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '1s' }}>{'{ }'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '1.5s' }}>{'console.log()'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '2s' }}>{'=> {}'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '2.5s' }}>{'class'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '3s' }}>{'import'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '3.5s' }}>{'const'}</div>
            <div className="particle animate-fade-in-up" style={{ animationDelay: '4s' }}>{'return'}</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-7xl md:text-8xl font-bold gradient-text mb-8 fahkwang-title">
                evalu8
              </h1>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-2xl md:text-3xl text-white/90 mb-6 font-light">
                Master Your Technical Skills
              </p>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <p className="text-lg text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Comprehensive technical assessment platform with interactive coding challenges, 
                detailed analytics, and personalized improvement suggestions.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="glass-card px-6 py-3 rounded-full interactive-element">
                <div className="flex items-center space-x-2 text-white">
                  <Target className="h-5 w-5 text-green-400" />
                  <span>Interactive Challenges</span>
                </div>
              </div>
              <div className="glass-card px-6 py-3 rounded-full interactive-element">
                <div className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <span>Detailed Analytics</span>
                </div>
              </div>
              <div className="glass-card px-6 py-3 rounded-full interactive-element">
                <div className="flex items-center space-x-2 text-white">
                  <GraduationCap className="h-5 w-5 text-orange-400" />
                  <span>Skill Growth</span>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="modern-button text-xl px-12 py-6 rounded-full text-white font-bold hover:scale-105 transition-all duration-300"
              >
                <Rocket className="h-6 w-6 mr-3" />
                Start Your Journey
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section with Glass Cards */}
        <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h3 className="text-5xl font-bold gradient-text mb-6 fahkwang-title">
                Platform Features
              </h3>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Discover powerful tools designed to accelerate your coding journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-3xl interactive-element animate-slide-in-left">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-6 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full backdrop-blur-sm animate-float">
                      <Target className="h-12 w-12 text-green-400" />
                    </div>
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-4 fahkwang-title">Practice Hub</h4>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    Practice with individual domain assessments. Take unlimited attempts to improve your skills in specific areas.
                  </p>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 text-green-400">
                      <Target className="h-4 w-4" />
                      <span>Unlimited attempts</span>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-400">
                      <BarChart3 className="h-4 w-4" />
                      <span>Multiple domains</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-8 rounded-3xl interactive-element animate-slide-in-right">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-6 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full backdrop-blur-sm animate-pulse-glow">
                      <Trophy className="h-12 w-12 text-purple-400" />
                    </div>
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-4 fahkwang-title">Mastery Assessments</h4>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    Take comprehensive one-time certification assessments that test multiple domains simultaneously.
                  </p>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 text-orange-400">
                      <Trophy className="h-4 w-4" />
                      <span>Certification ready</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-400">
                      <Target className="h-4 w-4" />
                      <span>Comprehensive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Modern Dashboard Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="geometric-bg">
          <div className="orb-bg orb-1"></div>
          <div className="orb-bg orb-2"></div>
          <div className="shape shape-circle w-16 h-16 top-[15%] left-[8%] animate-float"></div>
          <div className="shape shape-square w-12 h-12 top-[60%] right-[10%] animate-drift"></div>
          <div className="shape shape-circle w-8 h-8 bottom-[25%] left-[15%] animate-spin-slow"></div>
        </div>

        {/* Enhanced Code Particles */}
        <div className="code-particles">
          <div className="particle animate-fade-in-up" style={{ animationDelay: '0s' }}>{'<code>'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{'function()'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '1s' }}>{'{ }'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '1.5s' }}>{'console.log()'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '2s' }}>{'=> {}'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '2.5s' }}>{'class'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '3s' }}>{'import'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '3.5s' }}>{'const'}</div>
          <div className="particle animate-fade-in-up" style={{ animationDelay: '4s' }}>{'return'}</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-6xl font-bold gradient-text mb-8 fahkwang-title">
              Welcome Back
            </h2>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-2xl text-white/90 mb-8 font-light">
              Continue Your Learning Journey
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="glass-card px-6 py-3 rounded-full interactive-element">
              <div className="flex items-center space-x-2 text-white">
                <Target className="h-5 w-5 text-green-400 animate-pulse" />
                <span>Master your skills</span>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-full interactive-element">
              <div className="flex items-center space-x-2 text-white">
                <Rocket className="h-5 w-5 text-purple-400 animate-bounce" />
                <span>Boost confidence</span>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-full interactive-element">
              <div className="flex items-center space-x-2 text-white">
                <Lightbulb className="h-5 w-5 text-orange-400 animate-pulse" />
                <span>Unlock potential</span>
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Choose between practice sessions, comprehensive assessments, or check your performance history.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Dashboard Navigation */}
      <section className="py-12 bg-gradient-to-b from-slate-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <h3 className="text-4xl font-bold gradient-text mb-4 fahkwang-title">Choose Your Path</h3>
            <p className="text-white/80 text-lg">Select the learning experience that fits your goals</p>
          </div>
          
          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12 glass-card border-white/10 bg-white/5">
              <TabsTrigger 
                value="practice" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-white/70 font-semibold flex items-center space-x-2 transition-all duration-300"
              >
                <Target className="h-4 w-4" />
                <span>Practice Hub</span>
              </TabsTrigger>
              <TabsTrigger 
                value="mastery" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-white/70 font-semibold flex items-center space-x-2 transition-all duration-300"
              >
                <Trophy className="h-4 w-4" />
                <span>Mastery Assessments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-white/70 font-semibold flex items-center space-x-2 transition-all duration-300"
              >
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
