import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Settings, Lock, Palette } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'password'>('profile');
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
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Profile</CardTitle>
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="px-2 py-1 text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                Profile
              </Button>
              <Button
                variant={activeTab === 'avatar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('avatar')}
                className="px-2 py-1 text-xs"
              >
                <Palette className="h-3 w-3 mr-1" />
                Avatar
              </Button>
              <Button
                variant={activeTab === 'password' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('password')}
                className="px-2 py-1 text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Password
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getAvatarDisplay(userProfile.avatar_url) || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
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
                  <h3 className="font-semibold text-lg" style={{ fontFamily: 'Fahkwang, sans-serif' }}>
                    {userProfile.full_name || 'Unknown User'}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                    <Mail className="h-3 w-3" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Joined {userProfile.created_at 
                        ? formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true })
                        : 'recently'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Activity Calendar */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Activity Overview
                </h4>
                <ActivityCalendar userId={userProfile.id} />
              </div>
            </div>
          )}

          {activeTab === 'avatar' && (
            <AvatarSelector
              currentAvatar={userProfile.avatar_url}
              userId={userProfile.id}
              onAvatarUpdate={onProfileUpdate}
            />
          )}

          {activeTab === 'password' && (
            <PasswordChangeForm onSuccess={() => setActiveTab('profile')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDropdown;
