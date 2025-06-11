
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuestionForm from './QuestionForm';
import QuestionFilters from './QuestionFilters';
import QuestionTable from './QuestionTable';

type QuestionType = 'mcq' | 'coding' | 'scenario';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface QuestionManagerProps {
  selectedModule: any;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ selectedModule }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['module-questions', selectedModule?.id, filterType, filterDifficulty],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('module_id', selectedModule.id)
        .order('created_at', { ascending: false });
      
      if (filterType && filterType !== 'all') query = query.eq('question_type', filterType as QuestionType);
      if (filterDifficulty && filterDifficulty !== 'all') query = query.eq('difficulty', filterDifficulty as DifficultyLevel);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedModule?.id,
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      toast({ title: 'Question deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error deleting question', variant: 'destructive' });
    },
  });

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions for {selectedModule?.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage questions specific to this module
              </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingQuestion(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </DialogTitle>
                </DialogHeader>
                <QuestionForm 
                  question={editingQuestion} 
                  selectedModule={selectedModule}
                  onClose={() => {
                    setIsFormOpen(false);
                    setEditingQuestion(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <QuestionFilters
            filterType={filterType}
            filterDifficulty={filterDifficulty}
            onTypeChange={setFilterType}
            onDifficultyChange={setFilterDifficulty}
            hideModuleFilter={true}
          />

          <QuestionTable
            questions={questions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionManager;
