
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, TrendingUp, Mail, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  assessment_count?: number;
  last_assessment?: string;
  avatar_url?: string;
}

interface UserCardProps {
  user: User;
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityBadge = () => {
    if (!user.assessment_count || user.assessment_count === 0) {
      return <Badge variant="secondary">No Assessments</Badge>;
    }
    
    if (user.assessment_count >= 5) {
      return <Badge className="bg-green-100 text-green-800">Highly Active</Badge>;
    }
    
    if (user.assessment_count >= 2) {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">New User</Badge>;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user.full_name ? getInitials(user.full_name) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {user.full_name || 'Unknown User'}
            </h3>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {getActivityBadge()}
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span>{user.assessment_count || 0} assessments</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span>
                {user.last_assessment 
                  ? formatDistanceToNow(new Date(user.last_assessment), { addSuffix: true })
                  : 'Never'
                }
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 pt-1 border-t">
            Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
