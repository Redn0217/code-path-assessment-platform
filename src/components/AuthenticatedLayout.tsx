
import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigation } from '@/contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from './profile/ProfileIcon';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { isNavigationRestricted, restrictionReason } = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

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

  const handleLogout = async () => {
    if (isNavigationRestricted) {
      toast({
        title: "Cannot logout",
        description: restrictionReason + ". Please complete your assessment first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLogoClick = () => {
    if (isNavigationRestricted) {
      toast({
        title: "Navigation Restricted",
        description: restrictionReason + ". Please complete your assessment first.",
        variant: "destructive",
      });
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bright-bg-primary">
      {/* Modern Sticky Header */}
      <header className="modern-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
                alt="evalu8 Logo"
                className={`h-8 w-auto navbar-logo ${isNavigationRestricted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                onClick={handleLogoClick}
              />
              {isNavigationRestricted && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50/90 px-3 py-1 rounded-full border border-amber-200 backdrop-blur-sm">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Assessment in Progress</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="fahkwang-name text-sm bright-text-primary inspiring-text font-medium navbar-inspire">
                  Welcome, {userProfile?.full_name || user.email}! 🚀
                </span>
              )}
              {user && userProfile && (
                <ProfileIcon
                  userProfile={userProfile}
                  onProfileUpdate={() => fetchUserProfile(user.id)}
                />
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className={`navbar-button flex items-center space-x-2 bright-button-secondary ${
                  isNavigationRestricted
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
                disabled={isNavigationRestricted}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
};

export default AuthenticatedLayout;
