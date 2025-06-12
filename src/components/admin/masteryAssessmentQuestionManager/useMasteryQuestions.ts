
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type QuestionType = 'mcq' | 'coding' | 'scenario';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export const useMasteryQuestions = (
  assessment: any,
  parsedDomains: string[],
  filterType: string,
  filterDifficulty: string,
  filterDomain: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['mastery-assessment-questions', assessment?.id, filterType, filterDifficulty, filterDomain],
    queryFn: async () => {
      if (!assessment?.id) {
        console.log('No assessment ID found');
        return [];
      }
      
      console.log('Fetching questions for mastery assessment:', assessment.id);
      
      let query = supabase
        .from('mastery_assessment_questions')
        .select('*')
        .eq('mastery_assessment_id', assessment.id)
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
      if (error) {
        console.error('Error fetching mastery assessment questions:', error);
        throw error;
      }
      
      console.log('Fetched mastery assessment questions:', data?.length || 0);
      return data || [];
    },
    enabled: !!assessment?.id,
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mastery_assessment_questions').delete().eq('id', id);
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestion.mutate(id);
    }
  };

  return {
    questions: questionsQuery.data,
    isLoading: questionsQuery.isLoading,
    handleDelete,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] })
  };
};
