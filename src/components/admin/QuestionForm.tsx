
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuestionFormData } from './questionForm/useQuestionFormData';
import { useQuestionFormValidation } from './questionForm/questionFormValidation';
import BasicQuestionFields from './questionForm/BasicQuestionFields';
import McqOptionsSection from './questionForm/McqOptionsSection';
import CodingSection from './questionForm/CodingSection';
import AnswerAndTagsSection from './questionForm/AnswerAndTagsSection';

interface QuestionFormProps {
  question?: any;
  selectedModule?: any;
  onClose: () => void;
  assessmentDomains?: string[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({ 
  question, 
  selectedModule, 
  onClose,
  assessmentDomains 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateForm } = useQuestionFormValidation();
  
  const {
    formData,
    setFormData,
    newTag,
    setNewTag,
  } = useQuestionFormData(question, selectedModule, assessmentDomains);

  const saveQuestion = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        options: data.question_type === 'mcq' ? data.options.filter((opt: string) => opt.trim()) : null,
        test_cases: data.question_type === 'coding' ? data.test_cases.filter((tc: any) => tc.input || tc.expected_output) : null,
        code_template: data.question_type === 'coding' ? data.code_template : null,
      };

      if (question) {
        const { error } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', question.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] });
      toast({ title: `Question ${question ? 'updated' : 'created'} successfully` });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: `Error ${question ? 'updating' : 'creating'} question`, 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    saveQuestion.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Module or Assessment Information */}
      <Card className="bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            {selectedModule ? (
              <>
                <Badge variant="outline">Module: {selectedModule.name}</Badge>
                <Badge variant="outline">Domain: {selectedModule.domain}</Badge>
              </>
            ) : assessmentDomains && (
              <Badge variant="outline">
                Assessment Domains: {assessmentDomains.join(', ')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <BasicQuestionFields 
        formData={formData} 
        setFormData={setFormData}
        availableDomains={assessmentDomains}
      />

      <McqOptionsSection formData={formData} setFormData={setFormData} />

      <CodingSection formData={formData} setFormData={setFormData} />

      <AnswerAndTagsSection 
        formData={formData} 
        setFormData={setFormData}
        newTag={newTag}
        setNewTag={setNewTag}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveQuestion.isPending}>
          {saveQuestion.isPending ? 'Saving...' : (question ? 'Update' : 'Create')} Question
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
