import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Settings, Lock, Palette, LogOut, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
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
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm z-50"
    >
      <Card className="border-0 shadow-none bg-gradient-to-br from-white via-gray-50/50 to-white">
        <div className="p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 text-left"
              onClick={() => handleNavigate('/profile')}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-brand-green" />
                <span className="font-medium">Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between h-12 text-left"
              onClick={() => handleNavigate('/settings')}
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-3 text-brand-green" />
                <span className="font-medium">Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between h-12 text-left"
              onClick={() => handleNavigate('/activity')}
            >
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-3 text-brand-green" />
                <span className="font-medium">Activity</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            
            <div className="pt-2 border-t border-gray-200">
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
        </div>
      </Card>
    </div>
  );
};

export default ProfileDropdown;
