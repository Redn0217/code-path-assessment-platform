import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, RefreshCw, Search, AlertTriangle, User, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MasteryAttemptManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test database connectivity
  const testDatabaseAccess = async () => {
    try {
      console.log('Testing database access...');

      // Test 1: Basic user_mastery_attempts access
      const test1 = await supabase
        .from('user_mastery_attempts')
        .select('id')
        .limit(1);
      console.log('Test 1 - user_mastery_attempts:', test1);

      // Test 2: Basic profiles access
      const test2 = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      console.log('Test 2 - profiles:', test2);

      // Test 3: Basic mastery_assessments access
      const test3 = await supabase
        .from('mastery_assessments')
        .select('id')
        .limit(1);
      console.log('Test 3 - mastery_assessments:', test3);

      toast({
        title: "Database Test Complete",
        description: "Check browser console for detailed results",
      });
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: "Database Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Test delete permissions
  const testDeletePermissions = async () => {
    try {
      console.log('Testing delete permissions...');

      // First, try to create a test record
      const testRecord = {
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        mastery_assessment_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        total_questions: 1,
        answers: {},
        started_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from('user_mastery_attempts')
        .insert(testRecord)
        .select()
        .single();

      if (insertError) {
        console.log('Cannot create test record (this is expected):', insertError);

        // If we can't create, try to delete an existing record (if any)
        if (attempts.length > 0) {
          const testAttemptId = attempts[0].id;
          console.log('Testing delete on existing record:', testAttemptId);

          const { data: deleteData, error: deleteError } = await supabase
            .from('user_mastery_attempts')
            .delete()
            .eq('id', testAttemptId)
            .select();

          if (deleteError) {
            console.error('Delete test failed:', deleteError);
            toast({
              title: "Delete Permission Test Failed",
              description: `Cannot delete: ${deleteError.message}`,
              variant: "destructive",
            });
          } else {
            console.log('Delete test successful (record was deleted):', deleteData);
            toast({
              title: "Delete Test Successful",
              description: "Delete permissions are working. Record was actually deleted!",
              variant: "destructive", // Warning because we actually deleted something
            });
            refetch(); // Refresh the list
          }
        } else {
          toast({
            title: "No Records to Test Delete",
            description: "No attempts available to test delete permissions",
          });
        }
      } else {
        console.log('Test record created:', insertData);

        // Now try to delete the test record
        const { data: deleteData, error: deleteError } = await supabase
          .from('user_mastery_attempts')
          .delete()
          .eq('id', insertData.id)
          .select();

        if (deleteError) {
          console.error('Delete test failed:', deleteError);
          toast({
            title: "Delete Permission Test Failed",
            description: `Cannot delete: ${deleteError.message}`,
            variant: "destructive",
          });
        } else {
          console.log('Delete test successful:', deleteData);
          toast({
            title: "Delete Test Successful",
            description: "Both insert and delete permissions are working",
          });
        }
      }
    } catch (error) {
      console.error('Delete permission test failed:', error);
      toast({
        title: "Delete Permission Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Alternative delete using RPC (bypasses RLS)
  const deleteAttemptViaRPC = async (attemptId: string) => {
    try {
      console.log('Attempting RPC delete for attempt:', attemptId);

      // This would require a custom RPC function in Supabase
      // For now, we'll try a direct SQL approach using the REST API
      const response = await fetch(`https://qqugxsihucjvuucgsjmx.supabase.co/rest/v1/rpc/delete_mastery_attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdWd4c2lodWNqdnV1Y2dzam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwMDQsImV4cCI6MjA2NTExNjAwNH0.OnRMJe7u5_S3CrlWfo_fHmkmHJ1i6lceat85cRMYzB4`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdWd4c2lodWNqdnV1Y2dzam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAwMDQsImV4cCI6MjA2NTExNjAwNH0.OnRMJe7u5_S3CrlWfo_fHmkmHJ1i6lceat85cRMYzB4'
        },
        body: JSON.stringify({ attempt_id: attemptId })
      });

      if (!response.ok) {
        throw new Error(`RPC delete failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('RPC delete result:', result);

      return result;
    } catch (error) {
      console.error('RPC delete failed:', error);
      throw error;
    }
  };

  // Fetch all mastery assessments for filter dropdown
  const { data: assessments = [] } = useQuery({
    queryKey: ['mastery-assessments-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastery_assessments')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all user attempts with user and assessment details
  const { data: attempts = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['all-mastery-attempts', searchTerm, selectedAssessment],
    queryFn: async () => {
      console.log('Fetching mastery attempts using separate queries approach...');

      try {
        // Always use the separate queries approach to avoid RLS issues
        console.log('Fetching data from separate tables...');

        const [attemptsResult, profilesResult, assessmentsResult] = await Promise.all([
          supabase
            .from('user_mastery_attempts')
            .select('*')
            .order('started_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('id, email, full_name'),
          supabase
            .from('mastery_assessments')
            .select('id, title, difficulty, total_questions, time_limit_minutes')
        ]);

        console.log('Attempts result:', attemptsResult);
        console.log('Profiles result:', profilesResult);
        console.log('Assessments result:', assessmentsResult);

        if (attemptsResult.error) {
          console.error('Error fetching attempts:', attemptsResult.error);
          throw new Error(`Failed to fetch attempts: ${attemptsResult.error.message}`);
        }
        if (profilesResult.error) {
          console.error('Error fetching profiles:', profilesResult.error);
          throw new Error(`Failed to fetch profiles: ${profilesResult.error.message}`);
        }
        if (assessmentsResult.error) {
          console.error('Error fetching assessments:', assessmentsResult.error);
          throw new Error(`Failed to fetch assessments: ${assessmentsResult.error.message}`);
        }

        // Combine the data manually
        const combinedData = (attemptsResult.data || []).map(attempt => {
          const profile = profilesResult.data?.find(p => p.id === attempt.user_id);
          const assessment = assessmentsResult.data?.find(a => a.id === attempt.mastery_assessment_id);

          return {
            ...attempt,
            profiles: profile || { id: attempt.user_id, email: 'Unknown User', full_name: 'Unknown' },
            mastery_assessments: assessment || { id: attempt.mastery_assessment_id, title: 'Unknown Assessment', difficulty: 'unknown', total_questions: 0, time_limit_minutes: 0 }
          };
        });

        console.log('Combined data:', combinedData);

        // Apply filters
        let filteredData = combinedData;

        if (selectedAssessment && selectedAssessment !== 'all') {
          filteredData = filteredData.filter(attempt =>
            attempt.mastery_assessment_id === selectedAssessment
          );
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredData = filteredData.filter(attempt =>
            attempt.profiles?.email?.toLowerCase().includes(searchLower) ||
            attempt.profiles?.full_name?.toLowerCase().includes(searchLower)
          );
        }

        console.log('Final filtered data:', filteredData);
        return filteredData;

      } catch (error) {
        console.error('Error in mastery attempts query:', error);
        throw error;
      }
    },
  });

  // Reset attempt mutation
  const resetAttemptMutation = useMutation({
    mutationFn: async (attemptId: string) => {
      console.log('Attempting to delete attempt:', attemptId);

      // First, try to verify the attempt exists
      const { data: existingAttempt, error: fetchError } = await supabase
        .from('user_mastery_attempts')
        .select('id, user_id, mastery_assessment_id')
        .eq('id', attemptId)
        .single();

      if (fetchError) {
        console.error('Error fetching attempt before delete:', fetchError);
        throw new Error(`Cannot find attempt to delete: ${fetchError.message}`);
      }

      console.log('Found attempt to delete:', existingAttempt);

      // Try to delete the attempt
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .delete()
        .eq('id', attemptId)
        .select(); // Return deleted rows to confirm deletion

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message} (Code: ${error.code})`);
      }

      console.log('Delete result:', data);

      if (!data || data.length === 0) {
        throw new Error('No rows were deleted. The attempt may not exist or you may not have permission to delete it.');
      }

      return data[0];
    },
    onSuccess: (deletedAttempt) => {
      console.log('Successfully deleted attempt:', deletedAttempt);
      queryClient.invalidateQueries({ queryKey: ['all-mastery-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery-attempts'] });
      toast({
        title: "Attempt Reset Successfully",
        description: "User can now retake the mastery assessment.",
      });
    },
    onError: (error: any) => {
      console.error('Reset attempt error:', error);
      toast({
        title: "Failed to Reset Attempt",
        description: error.message || "Failed to reset attempt. Check console for details.",
        variant: "destructive",
      });
    },
  });

  // Bulk reset mutation
  const bulkResetMutation = useMutation({
    mutationFn: async (attemptIds: string[]) => {
      console.log('Attempting to bulk delete attempts:', attemptIds);

      // First, verify which attempts exist
      const { data: existingAttempts, error: fetchError } = await supabase
        .from('user_mastery_attempts')
        .select('id')
        .in('id', attemptIds);

      if (fetchError) {
        console.error('Error fetching attempts before bulk delete:', fetchError);
        throw new Error(`Cannot verify attempts to delete: ${fetchError.message}`);
      }

      console.log('Found attempts to delete:', existingAttempts?.length || 0);

      if (!existingAttempts || existingAttempts.length === 0) {
        throw new Error('No attempts found to delete.');
      }

      // Try to delete the attempts
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .delete()
        .in('id', attemptIds)
        .select(); // Return deleted rows to confirm deletion

      if (error) {
        console.error('Bulk delete error:', error);
        throw new Error(`Bulk delete failed: ${error.message} (Code: ${error.code})`);
      }

      console.log('Bulk delete result:', data);

      const deletedCount = data?.length || 0;
      if (deletedCount === 0) {
        throw new Error('No rows were deleted. You may not have permission to delete these attempts.');
      }

      return deletedCount;
    },
    onSuccess: (count) => {
      console.log('Successfully bulk deleted attempts:', count);
      queryClient.invalidateQueries({ queryKey: ['all-mastery-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery-attempts'] });
      toast({
        title: "Attempts Reset Successfully",
        description: `${count} attempt(s) have been reset successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Bulk reset error:', error);
      toast({
        title: "Failed to Reset Attempts",
        description: error.message || "Failed to reset attempts. Check console for details.",
        variant: "destructive",
      });
    },
  });

  const handleResetAttempt = (attemptId: string, userEmail: string, assessmentTitle: string) => {
    if (window.confirm(
      `Are you sure you want to reset the attempt for "${userEmail}" on "${assessmentTitle}"?\n\n` +
      `This will allow the user to retake the assessment. This action cannot be undone.`
    )) {
      resetAttemptMutation.mutate(attemptId);
    }
  };

  const handleBulkReset = (assessmentId: string, assessmentTitle: string) => {
    const assessmentAttempts = attempts.filter(
      attempt => attempt.mastery_assessment_id === assessmentId
    );
    
    if (assessmentAttempts.length === 0) {
      toast({
        title: "No Attempts",
        description: "No attempts found for this assessment.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(
      `Are you sure you want to reset ALL ${assessmentAttempts.length} attempt(s) for "${assessmentTitle}"?\n\n` +
      `This will allow all users to retake this assessment. This action cannot be undone.`
    )) {
      bulkResetMutation.mutate(assessmentAttempts.map(attempt => attempt.id));
    }
  };

  const getStatusBadge = (attempt: any) => {
    if (attempt.completed_at) {
      const percentage = attempt.score ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;
      return (
        <Badge className="bg-green-100 text-green-800">
          <Trophy className="h-3 w-3 mr-1" />
          Completed ({percentage}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          In Progress
        </Badge>
      );
    }
  };

  if (queryError) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Mastery Attempt Manager</h3>
          <p className="text-gray-600">Reset user attempts to allow retaking mastery assessments</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">
                Failed to load mastery attempts. This might be due to database permissions, RLS policies, or connectivity issues.
              </p>
              <div className="text-sm text-gray-500 mb-4 space-y-2">
                <p><strong>Error:</strong> {queryError?.message || 'Unknown error'}</p>
                <p><strong>Possible causes:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Row Level Security (RLS) policies blocking admin access</li>
                  <li>Missing foreign key relationships between tables</li>
                  <li>Admin user not properly configured in admin_users table</li>
                  <li>Database connectivity issues</li>
                </ul>
              </div>
              <div className="space-x-2">
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={testDatabaseAccess} variant="secondary" size="sm">
                  Test Database
                </Button>
                <Button onClick={testDeletePermissions} variant="destructive" size="sm">
                  Test Delete
                </Button>
                <Button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  variant="ghost"
                  size="sm"
                >
                  {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                </Button>
              </div>

              {showDebugInfo && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                  <p><strong>Debug Information:</strong></p>
                  <p>Query Error: {JSON.stringify(queryError, null, 2)}</p>
                  <p>Search Term: {searchTerm}</p>
                  <p>Selected Assessment: {selectedAssessment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading mastery attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Mastery Attempt Manager</h3>
        <p className="text-gray-600">Reset user attempts to allow retaking mastery assessments</p>
        
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Warning:</p>
              <p>Resetting attempts will permanently delete the user's previous results and allow them to retake the assessment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessments</SelectItem>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAssessment !== 'all' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Bulk Actions</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const assessment = assessments.find(a => a.id === selectedAssessment);
                  if (assessment) {
                    handleBulkReset(selectedAssessment, assessment.title);
                  }
                }}
                disabled={bulkResetMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {bulkResetMutation.isPending ? 'Resetting...' : 'Reset All Attempts'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Attempts ({attempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No attempts found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {attempt.profiles.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.profiles.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attempt.mastery_assessments.title}</div>
                        <div className="text-sm text-gray-500">
                          {attempt.mastery_assessments.difficulty} • {attempt.mastery_assessments.total_questions} questions
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(attempt)}
                    </TableCell>
                    <TableCell>
                      {new Date(attempt.started_at).toLocaleDateString()} {new Date(attempt.started_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {attempt.completed_at ? (
                        <>
                          {new Date(attempt.completed_at).toLocaleDateString()} {new Date(attempt.completed_at).toLocaleTimeString()}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleResetAttempt(
                          attempt.id,
                          attempt.profiles.email,
                          attempt.mastery_assessments.title
                        )}
                        disabled={resetAttemptMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasteryAttemptManager;
