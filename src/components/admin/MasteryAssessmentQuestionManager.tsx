
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QuestionForm from './QuestionForm';
import QuestionFilters from './QuestionFilters';
import QuestionTable from './QuestionTable';

type QuestionType = 'mcq' | 'coding' | 'scenario';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface MasteryAssessmentQuestionManagerProps {
  assessment: any;
  onBack: () => void;
}

const MasteryAssessmentQuestionManager: React.FC<MasteryAssessmentQuestionManagerProps> = ({ 
  assessment, 
  onBack 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get questions for domains included in this mastery assessment
  const { data: questions, isLoading } = useQuery({
    queryKey: ['mastery-assessment-questions', assessment?.id, filterType, filterDifficulty, filterDomain],
    queryFn: async () => {
      if (!assessment?.domains || !Array.isArray(assessment.domains)) return [];
      
      let query = supabase
        .from('questions')
        .select('*')
        .in('domain', assessment.domains)
        .order('created_at', { ascending: false });
      
      if (filterType && filterType !== 'all') {
        query = query.eq('question_type', filterType as QuestionType);
      }
      if (filterDifficulty && filterDifficulty !== 'all') {
        query = query.eq('difficulty', filterDifficulty as DifficultyLevel);
      }
      if (filterDomain && filterDomain !== 'all') {
        query = query.eq('domain', filterDomain);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!assessment?.id,
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] });
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Mastery Assessments
              </Button>
              <div>
                <CardTitle>Questions for {assessment?.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage questions for domains: {assessment?.domains?.join(', ')}
                </p>
              </div>
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
                  selectedModule={null}
                  onClose={() => {
                    setIsFormOpen(false);
                    setEditingQuestion(null);
                  }}
                  assessmentDomains={assessment?.domains}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <QuestionFilters
            filterType={filterType}
            filterDifficulty={filterDifficulty}
            filterDomain={filterDomain}
            onTypeChange={setFilterType}
            onDifficultyChange={setFilterDifficulty}
            onDomainChange={setFilterDomain}
            hideModuleFilter={true}
            availableDomains={assessment?.domains || []}
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

export default MasteryAssessmentQuestionManager;
