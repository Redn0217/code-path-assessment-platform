
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        created_at: item.created_at, // Add this for QuestionTable compatibility
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

  // Calculate statistics
  const stats = {
    total: questions?.length || 0,
    mcq: questions?.filter(q => q.question_type === 'mcq').length || 0,
    coding: questions?.filter(q => q.question_type === 'coding').length || 0,
    scenario: questions?.filter(q => q.question_type === 'scenario').length || 0,
    beginner: questions?.filter(q => q.difficulty === 'beginner').length || 0,
    intermediate: questions?.filter(q => q.difficulty === 'intermediate').length || 0,
    advanced: questions?.filter(q => q.difficulty === 'advanced').length || 0,
  };

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
          <div className="flex flex-col gap-4">
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

            {/* Statistics Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <Badge
                  variant="secondary"
                  className="text-sm hover:bg-gray-300 transition-colors cursor-default"
                >
                  {stats.total} Questions
                </Badge>
              </div>

              <div className="h-4 w-px bg-gray-300 mx-1"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Types:</span>
                <Badge className="bg-blue-100 text-blue-800 text-sm hover:bg-blue-200 transition-colors cursor-default">
                  {stats.mcq} MCQ
                </Badge>
                <Badge className="bg-green-100 text-green-800 text-sm hover:bg-green-200 transition-colors cursor-default">
                  {stats.coding} Coding
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 text-sm hover:bg-purple-200 transition-colors cursor-default">
                  {stats.scenario} Scenario
                </Badge>
              </div>

              <div className="h-4 w-px bg-gray-300 mx-1"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-sm hover:bg-emerald-200 transition-colors cursor-default">
                  {stats.beginner} Beginner
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 text-sm hover:bg-yellow-200 transition-colors cursor-default">
                  {stats.intermediate} Intermediate
                </Badge>
                <Badge className="bg-red-100 text-red-800 text-sm hover:bg-red-200 transition-colors cursor-default">
                  {stats.advanced} Advanced
                </Badge>
              </div>
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
