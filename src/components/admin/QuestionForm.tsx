
import React, { useEffect } from 'react';
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
  masteryAssessmentId?: string;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  selectedModule,
  onClose,
  assessmentDomains,
  masteryAssessmentId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateForm } = useQuestionFormValidation();

  console.log('QuestionForm - Received question prop:', question);
  console.log('QuestionForm - Selected module:', selectedModule);
  console.log('QuestionForm - Assessment domains:', assessmentDomains);

  const {
    formData,
    setFormData,
    newTag,
    setNewTag,
  } = useQuestionFormData(question, selectedModule, assessmentDomains);

  console.log('QuestionForm - Current form data:', formData);

  // Log when question prop changes
  useEffect(() => {
    console.log('QuestionForm - Question prop changed:', question);
  }, [question]);

  const saveQuestion = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        options: data.question_type === 'mcq' ? data.options.filter((opt: string) => opt.trim()) : null,
        test_cases: data.question_type === 'coding' ? data.test_cases.filter((tc: any) => tc.input || tc.expected_output) : null,
        code_template: data.question_type === 'coding' ? data.code_template : null,
      };

      // Determine which table to use based on context
      const isMasteryQuestion = masteryAssessmentId || (question && question.source === 'mastery');

      if (isMasteryQuestion) {
        // Create a clean payload for mastery assessment questions table
        // Remove module_id completely as it doesn't exist in mastery_assessment_questions table
        const { module_id, ...cleanPayload } = payload;
        const masteryPayload = {
          ...cleanPayload,
          mastery_assessment_id: masteryAssessmentId || question?.mastery_assessment_id,
        };

        console.log('Mastery assessment payload:', masteryPayload);

        if (question) {
          const { error } = await supabase
            .from('mastery_assessment_questions')
            .update(masteryPayload)
            .eq('id', question.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('mastery_assessment_questions')
            .insert([masteryPayload]);
          if (error) throw error;
        }
      } else {
        // Regular question for modules using question bank architecture
        if (question) {
          // Update existing question in question bank
          const { error: bankError } = await supabase
            .from('question_bank')
            .update(payload)
            .eq('id', question.question_bank_id || question.id);
          if (bankError) throw bankError;
        } else {
          // Check if question already exists in question bank
          const { data: existingQuestions, error: checkError } = await supabase
            .from('question_bank')
            .select('id')
            .eq('title', payload.title)
            .eq('question_text', payload.question_text)
            .limit(1);

          if (checkError) throw checkError;

          let newBankQuestion;

          if (existingQuestions && existingQuestions.length > 0) {
            // Question already exists, use the existing one
            const { data: existingQuestion, error: fetchError } = await supabase
              .from('question_bank')
              .select('*')
              .eq('id', existingQuestions[0].id)
              .single();

            if (fetchError) throw fetchError;
            newBankQuestion = existingQuestion;

            toast({
              title: 'Using Existing Question',
              description: 'A question with the same title and content already exists in the question bank. Using the existing question.',
              variant: 'default'
            });
          } else {
            // Create new question in question bank
            const { data: createdQuestion, error: bankError } = await supabase
              .from('question_bank')
              .insert([payload])
              .select()
              .single();

            if (bankError) throw bankError;
            newBankQuestion = createdQuestion;
          }

          // If we have a selected module, assign the question to it
          if (selectedModule?.id && newBankQuestion) {
            const { error: assignError } = await supabase
              .from('questions')
              .insert([{
                module_id: selectedModule.id,
                question_bank_id: newBankQuestion.id,
                // Copy required fields from question bank
                title: newBankQuestion.title,
                question_text: newBankQuestion.question_text,
                question_type: newBankQuestion.question_type,
                difficulty: newBankQuestion.difficulty,
                domain: newBankQuestion.domain,
                options: newBankQuestion.options,
                correct_answer: newBankQuestion.correct_answer,
                explanation: newBankQuestion.explanation,
                code_template: newBankQuestion.code_template,
                test_cases: newBankQuestion.test_cases,
                time_limit: newBankQuestion.time_limit,
                memory_limit: newBankQuestion.memory_limit,
                tags: newBankQuestion.tags
              }]);

            if (assignError) throw assignError;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank-mastery'] });
      toast({ title: `Question ${question ? 'updated' : 'created'} successfully` });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error saving question:', error);
      toast({
        title: `Error ${question ? 'updating' : 'creating'} question`,
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, selectedModule)) {
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
        selectedModule={selectedModule}
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
