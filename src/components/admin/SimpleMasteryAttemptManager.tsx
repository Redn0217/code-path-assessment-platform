import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SimpleMasteryAttemptManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch only user_mastery_attempts (minimal approach)
  const { data: attempts = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['simple-mastery-attempts'],
    queryFn: async () => {
      console.log('Fetching mastery attempts (simple approach)...');
      
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error);
        throw error;
      }

      console.log('Fetched attempts:', data);
      return data || [];
    },
  });

  // Reset attempt mutation
  const resetAttemptMutation = useMutation({
    mutationFn: async (attemptId: string) => {
      console.log('Simple manager: Attempting to delete attempt:', attemptId);

      // Try to delete the attempt with detailed error handling
      const { data, error } = await supabase
        .from('user_mastery_attempts')
        .delete()
        .eq('id', attemptId)
        .select(); // Return deleted rows to confirm deletion

      if (error) {
        console.error('Simple manager delete error:', error);
        throw new Error(`Delete failed: ${error.message} (Code: ${error.code || 'unknown'})`);
      }

      console.log('Simple manager delete result:', data);

      if (!data || data.length === 0) {
        throw new Error('No rows were deleted. The attempt may not exist or you may not have permission to delete it.');
      }

      return data[0];
    },
    onSuccess: (deletedAttempt) => {
      console.log('Simple manager: Successfully deleted attempt:', deletedAttempt);
      queryClient.invalidateQueries({ queryKey: ['simple-mastery-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery-attempts'] });
      toast({
        title: "Attempt Deleted Successfully",
        description: "User attempt has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Simple manager reset attempt error:', error);
      toast({
        title: "Failed to Delete Attempt",
        description: error.message || "Failed to delete attempt. Check console for details.",
        variant: "destructive",
      });
    },
  });

  const handleResetAttempt = (attemptId: string) => {
    if (window.confirm(
      `Are you sure you want to reset this attempt?\n\n` +
      `This will permanently delete the attempt record. This action cannot be undone.`
    )) {
      resetAttemptMutation.mutate(attemptId);
    }
  };

  const getStatusBadge = (attempt: any) => {
    if (attempt.completed_at) {
      const percentage = attempt.score ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;
      return (
        <Badge className="bg-green-100 text-green-800">
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
          <h3 className="text-2xl font-bold text-gray-900">Simple Mastery Attempt Manager</h3>
          <p className="text-gray-600">Basic attempt management (fallback mode)</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">
                Failed to load mastery attempts.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Error: {queryError?.message || 'Unknown error'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
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
        <h3 className="text-2xl font-bold text-gray-900">Simple Mastery Attempt Manager</h3>
        <p className="text-gray-600">Basic attempt management (shows raw attempt data)</p>
        
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Fallback Mode:</p>
              <p>This is a simplified version that shows raw attempt data without user/assessment details.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Attempts ({attempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No attempts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attempt ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Assessment ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-mono text-xs">
                      {attempt.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {attempt.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {attempt.mastery_assessment_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(attempt)}
                    </TableCell>
                    <TableCell>
                      {new Date(attempt.started_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {attempt.completed_at ? (
                        new Date(attempt.completed_at).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attempt.score !== null ? `${attempt.score}/${attempt.total_questions}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleResetAttempt(attempt.id)}
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

export default SimpleMasteryAttemptManager;
