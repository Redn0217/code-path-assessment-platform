
import { useToast } from '@/hooks/use-toast';

export const useQuestionFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: any, selectedModule?: any) => {
    // When in module context, domain is not required as it's auto-populated from the module
    const isDomainRequired = !selectedModule;

    if (!formData.title || !formData.question_text || !formData.correct_answer || (isDomainRequired && !formData.domain)) {
      const missingFields = [];
      if (!formData.title) missingFields.push('title');
      if (!formData.question_text) missingFields.push('question text');
      if (!formData.correct_answer) missingFields.push('correct answer');
      if (isDomainRequired && !formData.domain) missingFields.push('domain');

      toast({
        title: `Please fill in all required fields (${missingFields.join(', ')})`,
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
