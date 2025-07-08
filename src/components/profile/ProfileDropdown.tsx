import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [activeModal, setActiveModal] = useState<'profile' | 'password' | 'activity' | null>(null);
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
    <>
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm z-50"
      >
        <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl overflow-hidden">
          {/* Profile Row */}
          <button
            onClick={() => setActiveModal('profile')}
            className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-gray-800">Profile Information</div>
              <div className="text-sm text-gray-500">View your profile details</div>
            </div>
          </button>

          {/* Change Password Row */}
          <button
            onClick={() => setActiveModal('password')}
            className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-gray-800">Change Password</div>
              <div className="text-sm text-gray-500">Update your account password</div>
            </div>
          </button>

          {/* Activity Row */}
          <button
            onClick={() => setActiveModal('activity')}
            className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-gray-800">Activity Overview</div>
              <div className="text-sm text-gray-500">View your assessment activity</div>
            </div>
          </button>

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

      {/* Profile Modal */}
      <Dialog open={activeModal === 'profile'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Information</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 ring-2 ring-brand-green/20 ring-offset-2">
                <AvatarImage src={getAvatarDisplay(userProfile.avatar_url) || undefined} />
                <AvatarFallback className="bg-brand-green/10 text-brand-green text-xl font-semibold">
                  {getAvatarDisplay(userProfile.avatar_url) ? (
                    <span className="text-3xl">{getAvatarDisplay(userProfile.avatar_url)}</span>
                  ) : userProfile.full_name ? (
                    getInitials(userProfile.full_name)
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800 mb-2" style={{ fontFamily: 'Fahkwang, sans-serif' }}>
                  {userProfile.full_name || 'Unknown User'}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                  <Mail className="h-4 w-4 text-brand-green" />
                  <span className="font-medium">{userProfile.email}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-brand-green" />
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
              <h4 className="font-medium text-gray-800 mb-3">Avatar Options</h4>
              <AvatarSelector
                currentAvatar={userProfile.avatar_url}
                userId={userProfile.id}
                onAvatarUpdate={onProfileUpdate}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={activeModal === 'password'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-purple-600" />
              <span>Change Password</span>
            </DialogTitle>
          </DialogHeader>
          <PasswordChangeForm onSuccess={() => setActiveModal(null)} />
        </DialogContent>
      </Dialog>

      {/* Activity Modal */}
      <Dialog open={activeModal === 'activity'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-green-600" />
              <span>Activity Overview</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Track your assessment activity and progress over time.</p>
            <div className="bg-white/50 p-4 rounded-lg border border-white/30 backdrop-blur-sm">
              <ActivityCalendar userId={userProfile.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;
