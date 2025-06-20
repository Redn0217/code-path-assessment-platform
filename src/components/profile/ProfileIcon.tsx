import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface ProfileIconProps {
  userProfile: UserProfile | null;
  onProfileUpdate: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ userProfile, onProfileUpdate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-1 rounded-full hover:bg-gray-100 pulse-animation"
        onClick={handleAvatarClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={getAvatarDisplay(userProfile?.avatar_url) || undefined} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
            {getAvatarDisplay(userProfile?.avatar_url) ? (
              <span className="text-lg">{getAvatarDisplay(userProfile?.avatar_url)}</span>
            ) : userProfile?.full_name ? (
              getInitials(userProfile.full_name)
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isDropdownOpen && (
        <ProfileDropdown
          userProfile={userProfile}
          onClose={() => setIsDropdownOpen(false)}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfileIcon;
