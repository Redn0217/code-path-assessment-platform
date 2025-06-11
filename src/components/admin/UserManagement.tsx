
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, Calendar, TrendingUp } from 'lucide-react';
import UserCard from './userManagement/UserCard';
import UserDetails from './userManagement/UserDetails';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  assessment_count?: number;
  last_assessment?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users with their assessment statistics
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching users for admin panel...');
      
      // Fetch all users from auth.users table via admin API
      const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      console.log('Auth users fetched:', authResponse.users?.length || 0);

      // Get profile data and assessment counts for each user
      const usersWithStats = await Promise.all(
        authResponse.users.map(async (authUser) => {
          // Try to get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', authUser.id)
            .single();

          // Get assessment counts
          const { data: assessments, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, completed_at')
            .eq('user_id', authUser.id)
            .order('completed_at', { ascending: false });

          if (assessmentError) {
            console.error('Error fetching assessments for user:', authUser.id, assessmentError);
          }

          return {
            id: authUser.id,
            email: authUser.email || 'No email',
            full_name: profile?.full_name || authUser.user_metadata?.full_name || 'Unknown User',
            created_at: authUser.created_at,
            avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
            assessment_count: assessments?.length || 0,
            last_assessment: assessments?.[0]?.completed_at || null
          };
        })
      );

      console.log('Users with stats processed:', usersWithStats.length);
      return usersWithStats;
    },
  });

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error in UserManagement:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading users: {error.message}</p>
            <p className="text-sm mt-2">Make sure you have admin privileges to view user data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedUser) {
    return (
      <UserDetails 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((total, user) => total + (user.assessment_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(user => user.assessment_count && user.assessment_count > 0).length}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => setSelectedUser(user)}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No users found matching your search criteria.' : 'No users found.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
