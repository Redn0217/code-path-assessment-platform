import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Mail, Calendar, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import AvatarSelector from '@/components/profile/AvatarSelector';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarDisplay = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('avatar-')) {
      const avatarId = avatarUrl.replace('avatar-', '');
      const avatarOptions = [
        { id: 'default', emoji: '👤' },
        { id: 'man', emoji: '👨' },
        { id: 'woman', emoji: '👩' },
        { id: 'boy', emoji: '👦' },
        { id: 'girl', emoji: '👧' },
        { id: 'older-man', emoji: '👴' },
        { id: 'older-woman', emoji: '👵' },
        { id: 'man-beard', emoji: '🧔' },
        { id: 'woman-curly', emoji: '👩‍🦱' },
        { id: 'man-bald', emoji: '👨‍🦲' },
        { id: 'woman-blonde', emoji: '👱‍♀️' },
        { id: 'man-blonde', emoji: '👱‍♂️' },
        { id: 'scientist', emoji: '🧑‍🔬' },
        { id: 'teacher', emoji: '🧑‍🏫' },
        { id: 'student', emoji: '🧑‍🎓' },
        { id: 'technologist', emoji: '🧑‍💻' },
        { id: 'artist', emoji: '🧑‍🎨' },
        { id: 'cook', emoji: '🧑‍🍳' },
        { id: 'mechanic', emoji: '🧑‍🔧' },
        { id: 'doctor', emoji: '🧑‍⚕️' },
        { id: 'ninja', emoji: '🥷' },
        { id: 'superhero', emoji: '🦸' },
        { id: 'robot', emoji: '🤖' },
        { id: 'alien', emoji: '👽' },
      ];
      const avatar = avatarOptions.find(opt => opt.id === avatarId);
      return avatar?.emoji || null;
    }
    return avatarUrl;
  };

  if (!user || !userProfile) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bright-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
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
            <h1 className="fahkwang-title text-3xl font-bold bright-text-primary mb-2">My Profile</h1>
            <p className="bright-text-secondary">Manage your personal information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bright-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24 ring-4 ring-brand-green/20 ring-offset-4">
                      <AvatarImage src={getAvatarDisplay(userProfile.avatar_url) || undefined} />
                      <AvatarFallback className="bg-brand-green/10 text-brand-green text-2xl font-semibold">
                        {getAvatarDisplay(userProfile.avatar_url) ? (
                          <span className="text-4xl">{getAvatarDisplay(userProfile.avatar_url)}</span>
                        ) : userProfile.full_name ? (
                          getInitials(userProfile.full_name)
                        ) : (
                          <UserIcon className="h-10 w-10" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h2 className="fahkwang-name-elegant text-2xl mb-2">
                        {userProfile.full_name || 'Unknown User'}
                      </h2>
                      <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium">{userProfile.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          Member since {userProfile.created_at 
                            ? formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true })
                            : 'recently'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-4">Change Avatar</h3>
                        <AvatarSelector
                          currentAvatar={userProfile.avatar_url}
                          userId={userProfile.id}
                          onAvatarUpdate={() => {
                            fetchUserProfile(userProfile.id);
                            setIsEditing(false);
                          }}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats & Rank */}
            <div>
              <Card className="bright-card">
                <CardHeader>
                  <CardTitle className="text-xl">Rank & Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-brand-green/10 text-brand-green text-lg px-4 py-2">
                      Intermediate
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">Current Rank</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress to Next Rank</span>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-brand-green h-3 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-green">24</div>
                      <div className="text-xs text-gray-600">Assessments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-green">87%</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
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

export default Profile;