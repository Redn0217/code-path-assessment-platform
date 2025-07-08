import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, User as UserIcon, Bell, Shield, ChevronRight } from 'lucide-react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import { useTheme } from '@/contexts/ThemeProvider';

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bright-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bright-bg-primary py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="fahkwang-title text-3xl font-bold bright-text-primary mb-2">Settings</h1>
            <p className="bright-text-secondary">Manage your account preferences and security settings</p>
          </div>

          <div className="space-y-8">
            {/* Account Security */}
            <Card className="bright-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-brand-green" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-12 text-left border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 mr-3 text-brand-green" />
                          <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-gray-600">Update your account password</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <PasswordChangeForm onSuccess={() => setIsPasswordDialogOpen(false)} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bright-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-brand-green" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-base mb-2">Theme</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose your preferred theme for the application.
                    </p>
                    <div className="flex space-x-4">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        onClick={() => setTheme('light')}
                        className="flex-1"
                      >
                        Light Mode
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => setTheme('dark')}
                        className="flex-1"
                      >
                        Dark Mode
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        onClick={() => setTheme('system')}
                        className="flex-1"
                      >
                        System
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bright-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-brand-green" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base">Assessment Reminders</h3>
                      <p className="text-sm text-gray-600">Get notified about upcoming assessments</p>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base">Progress Updates</h3>
                      <p className="text-sm text-gray-600">Receive updates about your learning progress</p>
                    </div>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="bright-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-brand-green" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-base mb-2">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a copy of your assessment data and progress history.
                    </p>
                    <Button variant="outline" disabled>
                      Export Data (Coming Soon)
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-base mb-2">Account Deletion</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="outline" disabled className="text-red-600 border-red-200 hover:bg-red-50">
                      Delete Account (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;