import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatar: string | null;
  userId: string;
  onAvatarUpdate: () => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  currentAvatar, 
  userId, 
  onAvatarUpdate 
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isUpdating, setIsUpdating] = useState(false);

  // Avatar character options - using emoji and simple character representations
  const avatarOptions = [
    { id: 'default', emoji: '👤', name: 'Default' },
    { id: 'man', emoji: '👨', name: 'Man' },
    { id: 'woman', emoji: '👩', name: 'Woman' },
    { id: 'boy', emoji: '👦', name: 'Boy' },
    { id: 'girl', emoji: '👧', name: 'Girl' },
    { id: 'older-man', emoji: '👴', name: 'Older Man' },
    { id: 'older-woman', emoji: '👵', name: 'Older Woman' },
    { id: 'man-beard', emoji: '🧔', name: 'Man with Beard' },
    { id: 'woman-curly', emoji: '👩‍🦱', name: 'Woman with Curly Hair' },
    { id: 'man-bald', emoji: '👨‍🦲', name: 'Bald Man' },
    { id: 'woman-blonde', emoji: '👱‍♀️', name: 'Blonde Woman' },
    { id: 'man-blonde', emoji: '👱‍♂️', name: 'Blonde Man' },
    { id: 'scientist', emoji: '🧑‍🔬', name: 'Scientist' },
    { id: 'teacher', emoji: '🧑‍🏫', name: 'Teacher' },
    { id: 'student', emoji: '🧑‍🎓', name: 'Student' },
    { id: 'technologist', emoji: '🧑‍💻', name: 'Technologist' },
    { id: 'artist', emoji: '🧑‍🎨', name: 'Artist' },
    { id: 'cook', emoji: '🧑‍🍳', name: 'Cook' },
    { id: 'mechanic', emoji: '🧑‍🔧', name: 'Mechanic' },
    { id: 'doctor', emoji: '🧑‍⚕️', name: 'Doctor' },
    { id: 'ninja', emoji: '🥷', name: 'Ninja' },
    { id: 'superhero', emoji: '🦸', name: 'Superhero' },
    { id: 'robot', emoji: '🤖', name: 'Robot' },
    { id: 'alien', emoji: '👽', name: 'Alien' },
  ];

  const handleAvatarSelect = (avatarId: string) => {
    const avatarUrl = avatarId === 'default' ? null : `avatar-${avatarId}`;
    setSelectedAvatar(avatarUrl);
  };

  const handleSaveAvatar = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: selectedAvatar })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Avatar updated",
        description: "Your avatar has been successfully updated.",
      });

      onAvatarUpdate();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvatarDisplay = (avatarUrl: string | null) => {
    if (!avatarUrl) return avatarOptions[0].emoji;
    const avatarId = avatarUrl.replace('avatar-', '');
    const avatar = avatarOptions.find(opt => opt.id === avatarId);
    return avatar?.emoji || avatarOptions[0].emoji;
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-3">Choose Your Avatar</h4>
        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
          {avatarOptions.map((avatar) => {
            const avatarUrl = avatar.id === 'default' ? null : `avatar-${avatar.id}`;
            const isSelected = selectedAvatar === avatarUrl;
            
            return (
              <Button
                key={avatar.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`relative h-12 w-12 p-0 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleAvatarSelect(avatar.id)}
                title={avatar.name}
              >
                <span className="text-lg">{avatar.emoji}</span>
                {isSelected && (
                  <Check className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white rounded-full p-0.5" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Preview:</span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <span className="text-lg">{getAvatarDisplay(selectedAvatar)}</span>
            </AvatarFallback>
          </Avatar>
        </div>
        
        <Button
          onClick={handleSaveAvatar}
          disabled={isUpdating || selectedAvatar === currentAvatar}
          size="sm"
        >
          {isUpdating ? 'Saving...' : 'Save Avatar'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelector;
