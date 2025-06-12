
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Target } from 'lucide-react';
import MasteryAssessmentForm from '@/components/MasteryAssessmentForm';
import { useToast } from '@/hooks/use-toast';

const MasteryAssessmentsAdmin = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const { toast } = useToast();

  // Fetch mastery assessments
  const { data: assessments = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-mastery-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastery_assessments')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleEdit = (assessment: any) => {
    setEditingAssessment(assessment);
    setIsFormOpen(true);
  };

  const handleDelete = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('mastery_assessments')
        .delete()
        .eq('id', assessmentId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Mastery assessment deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAssessment(null);
    refetch();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading mastery assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Mastery Assessments Management</h3>
          <p className="text-gray-600">Manage one-time comprehensive assessments</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Assessment</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{assessment.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(assessment.difficulty)}>
                      {assessment.difficulty}
                    </Badge>
                    <Badge variant={assessment.is_active ? "secondary" : "destructive"}>
                      {assessment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(assessment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(assessment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {assessment.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{assessment.total_questions} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{assessment.time_limit_minutes} min</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Order:</strong> {assessment.order_index}</p>
                <p><strong>Domains:</strong> {Array.isArray(assessment.domains) ? assessment.domains.join(', ') : 'None'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No mastery assessments available.</p>
            <p className="text-sm text-gray-400 mt-2">Add some assessments to get started.</p>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <MasteryAssessmentForm
          assessment={editingAssessment}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default MasteryAssessmentsAdmin;
