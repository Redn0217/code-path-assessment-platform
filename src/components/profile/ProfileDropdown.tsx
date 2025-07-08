import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Settings, Lock, Palette, LogOut, ChevronLeft, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AvatarSelector from './AvatarSelector';
import PasswordChangeForm from './PasswordChangeForm';
import ActivityCalendar from './ActivityCalendar';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface ProfileDropdownProps {
  userProfile: UserProfile | null;
  onClose: () => void;
  onProfileUpdate: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  userProfile, 
  onClose, 
  onProfileUpdate 
}) => {
  const [activeView, setActiveView] = useState<'menu' | 'profile' | 'settings' | 'activity'>('menu');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
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
        onClose();
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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

  if (!userProfile) return null;

  const renderMenuView = () => (
    <div className="p-4">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-left"
          onClick={() => setActiveView('profile')}
        >
          <User className="h-5 w-5 mr-3 text-brand-green" />
          <span className="font-medium">Profile</span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-left"
          onClick={() => setActiveView('settings')}
        >
          <Settings className="h-5 w-5 mr-3 text-brand-green" />
          <span className="font-medium">Settings</span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-left"
          onClick={() => setActiveView('activity')}
        >
          <Activity className="h-5 w-5 mr-3 text-brand-green" />
          <span className="font-medium">Activity</span>
        </Button>
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-left text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Sign out</span>
        </Button>
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('menu')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">Profile</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-brand-green/20 ring-offset-2">
            <AvatarImage src={getAvatarDisplay(userProfile.avatar_url) || undefined} />
            <AvatarFallback className="bg-brand-green/10 text-brand-green text-lg font-semibold">
              {getAvatarDisplay(userProfile.avatar_url) ? (
                <span className="text-2xl">{getAvatarDisplay(userProfile.avatar_url)}</span>
              ) : userProfile.full_name ? (
                getInitials(userProfile.full_name)
              ) : (
                <User className="h-6 w-6" />
              )}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-800" style={{ fontFamily: 'Fahkwang, sans-serif' }}>
              {userProfile.full_name || 'Unknown User'}
            </h4>
            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
              <Mail className="h-3 w-3 text-brand-green" />
              <span>{userProfile.email}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Calendar className="h-3 w-3 text-brand-green" />
              <span>
                Member since {userProfile.created_at 
                  ? formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true })
                  : 'recently'
                }
              </span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h5 className="font-medium text-sm text-gray-700 mb-2">Rank & Progress</h5>
          <div className="bg-gradient-to-r from-brand-green/5 to-transparent p-3 rounded-lg border border-brand-green/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Rank</span>
              <Badge variant="secondary" className="bg-brand-green/10 text-brand-green">
                Intermediate
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-green h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">65% to next rank</p>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setActiveView('settings')}
          >
            <Palette className="h-4 w-4 mr-2" />
            Change Avatar
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('menu')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">Account Settings</h4>
          <PasswordChangeForm onSuccess={() => setActiveView('menu')} />
        </div>
        
        <Separator />
        
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-3">Avatar Settings</h4>
          <AvatarSelector
            currentAvatar={userProfile.avatar_url}
            userId={userProfile.id}
            onAvatarUpdate={onProfileUpdate}
          />
        </div>
      </div>
    </div>
  );

  const renderActivityView = () => (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('menu')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">Activity</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-base mb-3 flex items-center text-gray-800">
            <Activity className="h-5 w-5 mr-2 text-brand-green" />
            Recent Activity
          </h4>
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-200/60">
            <ActivityCalendar userId={userProfile.id} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm z-50"
    >
      <Card className="border-0 shadow-none bg-gradient-to-br from-white via-gray-50/50 to-white">
        {activeView === 'menu' && renderMenuView()}
        {activeView === 'profile' && renderProfileView()}
        {activeView === 'settings' && renderSettingsView()}
        {activeView === 'activity' && renderActivityView()}
      </Card>
    </div>
  );
};

export default ProfileDropdown;
