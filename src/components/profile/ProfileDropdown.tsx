import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Settings, Lock, Palette, LogOut } from 'lucide-react';
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm z-50"
    >
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl overflow-hidden">
        {/* Profile Row */}
        <div className="p-6 bg-gradient-to-r from-brand-green/5 via-transparent to-brand-green/5 border-b border-gray-100">
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
              <h3 className="font-bold text-lg text-gray-800 mb-1" style={{ fontFamily: 'Fahkwang, sans-serif' }}>
                {userProfile.full_name || 'Unknown User'}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                <Mail className="h-3 w-3 text-brand-green" />
                <span className="font-medium">{userProfile.email}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
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
        </div>

        {/* Change Password Row */}
        <div className="border-b border-gray-100">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Change Password</div>
                <div className="text-sm text-gray-500">Update your account password</div>
              </div>
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Change Password</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
              </div>
              <PasswordChangeForm onSuccess={() => setShowPasswordForm(false)} />
            </div>
          )}
        </div>

        {/* Activity Row */}
        <div className="border-b border-gray-100">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Activity Overview</div>
                <div className="text-sm text-gray-500">Your recent assessment activity</div>
              </div>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-200/60">
              <ActivityCalendar userId={userProfile.id} />
            </div>
          </div>
        </div>

        {/* Logout Row */}
        <div className="p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
