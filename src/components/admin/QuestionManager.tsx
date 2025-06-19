
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuestionForm from './QuestionForm';
import QuestionFilters from './QuestionFilters';
import QuestionTable from './QuestionTable';
import QuestionBankSelector from './QuestionBankSelector';

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
  const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['module-questions', selectedModule?.id, filterType, filterDifficulty],
    queryFn: async () => {
      // Query questions assigned to this module using the new architecture
      let query = supabase
        .from('questions')
        .select(`
          id,
          module_id,
          created_at,
          question_bank_id,
          question_bank!inner(
            title,
            question_text,
            question_type,
            difficulty,
            domain,
            options,
            correct_answer,
            explanation,
            code_template,
            test_cases,
            time_limit,
            memory_limit,
            tags,
            is_active
          )
        `)
        .eq('module_id', selectedModule.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to flatten the question bank content
      let transformedData = data?.map(item => ({
        id: item.id, // This is the questions table ID
        question_bank_id: item.question_bank_id,
        module_id: item.module_id,
        assigned_at: item.created_at,
        // Flatten question bank content
        ...item.question_bank,
      })) || [];

      // Apply filters
      if (filterType && filterType !== 'all') {
        transformedData = transformedData.filter(q => q.question_type === filterType);
      }
      if (filterDifficulty && filterDifficulty !== 'all') {
        transformedData = transformedData.filter(q => q.difficulty === filterDifficulty);
      }

      return transformedData;
    },
    enabled: !!selectedModule?.id,
  });

  const removeQuestionFromModule = useMutation({
    mutationFn: async (question: any) => {
      // Remove the question assignment from this module
      // The question remains in the question bank
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id); // This is the questions table ID, not question_bank ID
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({ title: 'Question removed from module successfully (remains in question bank)' });
    },
    onError: () => {
      toast({ title: 'Error removing question from module', variant: 'destructive' });
    },
  });

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleRemoveFromModule = (question: any) => {
    if (confirm('Are you sure you want to remove this question from the module? The question will remain in the question bank.')) {
      removeQuestionFromModule.mutate(question);
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
            <div className="flex items-center gap-2">
              <Dialog open={isBankSelectorOpen} onOpenChange={setIsBankSelectorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Library className="h-4 w-4 mr-2" />
                    Add from Question Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Questions from Question Bank</DialogTitle>
                  </DialogHeader>
                  <QuestionBankSelector
                    selectedModule={selectedModule}
                    onClose={() => setIsBankSelectorOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingQuestion(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Question
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
            onDelete={handleRemoveFromModule}
            deleteButtonText="Remove from Module"
            deleteButtonTooltip="Remove this question from the module (question will remain in question bank)"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionManager;
