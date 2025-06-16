
import { useToast } from '@/hooks/use-toast';

export const useQuestionFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: any) => {
    if (!formData.title || !formData.question_text || !formData.correct_answer || !formData.domain) {
      toast({
        title: 'Please fill in all required fields (title, question text, correct answer, and domain)',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.question_type === 'mcq' && formData.options.filter((opt: string) => opt.trim()).length < 2) {
      toast({
        title: 'MCQ questions need at least 2 options',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
