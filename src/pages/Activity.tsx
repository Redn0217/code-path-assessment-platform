import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityIcon, Calendar, TrendingUp, Award } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import ActivityCalendar from '@/components/profile/ActivityCalendar';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

const Activity = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (!user || !userProfile) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bright-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bright-bg-primary py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="fahkwang-title text-3xl font-bold bright-text-primary mb-2">Activity Overview</h1>
            <p className="bright-text-secondary">Track your learning journey and assessment progress</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Activity Stats */}
            <Card className="bright-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ActivityIcon className="h-8 w-8 text-brand-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-500">Assessments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bright-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-brand-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                    <p className="text-xs text-gray-500">Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bright-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-brand-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Improvement</p>
                    <p className="text-2xl font-bold text-gray-900">+15%</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bright-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-brand-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-xs text-gray-500">Unlocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Calendar */}
            <div className="lg:col-span-2">
              <Card className="bright-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <ActivityIcon className="h-5 w-5 mr-2 text-brand-green" />
                    Activity Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-200/60">
                    <ActivityCalendar userId={userProfile.id} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="bright-card">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">JavaScript Assessment</p>
                        <p className="text-xs text-gray-600">Score: 85% • 2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">React Practice</p>
                        <p className="text-xs text-gray-600">Score: 92% • 1 day ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">CSS Fundamentals</p>
                        <p className="text-xs text-gray-600">Score: 78% • 2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Algorithm Challenge</p>
                        <p className="text-xs text-gray-600">Score: 88% • 3 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Database Design</p>
                        <p className="text-xs text-gray-600">Score: 73% • 4 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Activity;