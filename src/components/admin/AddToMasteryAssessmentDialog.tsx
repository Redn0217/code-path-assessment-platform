import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddToMasteryAssessmentDialogProps {
  selectedQuestions: Set<string>;
  questions: any[];
  onSuccess?: () => void;
}

const AddToMasteryAssessmentDialog: React.FC<AddToMasteryAssessmentDialogProps> = ({
  selectedQuestions,
  questions,
  onSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');

  // Fetch mastery assessments
  const { data: masteryAssessments = [], isLoading } = useQuery({
    queryKey: ['mastery-assessments-for-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastery_assessments')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  // Add questions to mastery assessment
  const addQuestionsMutation = useMutation({
    mutationFn: async ({ assessmentId, questionIds }: { assessmentId: string; questionIds: string[] }) => {
      const questionsToAdd = questions.filter(q => questionIds.includes(q.id));
      
      const masteryQuestions = questionsToAdd.map(question => ({
        mastery_assessment_id: assessmentId,
        domain: question.domain || question.domain_name,
        question_type: question.question_type,
        difficulty: question.difficulty,
        title: question.title,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        code_template: question.code_template,
        test_cases: question.test_cases,
        time_limit: question.time_limit,
        memory_limit: question.memory_limit,
        tags: question.tags,
      }));

      const { error } = await supabase
        .from('mastery_assessment_questions')
        .insert(masteryQuestions);
      
      if (error) throw error;
      return masteryQuestions.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] });
      toast({
        title: "Questions Added Successfully",
        description: `${count} question(s) have been added to the mastery assessment.`,
      });
      setIsOpen(false);
      setSelectedAssessment('');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Questions",
        description: error.message || "Failed to add questions to mastery assessment.",
        variant: "destructive",
      });
    },
  });

  const handleAddQuestions = () => {
    if (!selectedAssessment) {
      toast({
        title: "No Assessment Selected",
        description: "Please select a mastery assessment first.",
        variant: "destructive",
      });
      return;
    }

    const questionIds = Array.from(selectedQuestions);
    addQuestionsMutation.mutate({ assessmentId: selectedAssessment, questionIds });
  };

  const selectedQuestionsData = questions.filter(q => selectedQuestions.has(q.id));
  const selectedAssessmentData = masteryAssessments.find(a => a.id === selectedAssessment);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add to Mastery Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Add Questions to Mastery Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Questions Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Selected Questions ({selectedQuestions.size})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedQuestionsData.map((question) => (
                  <div key={question.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{question.title}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {question.question_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Mastery Assessment</label>
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a mastery assessment..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading assessments...</SelectItem>
                ) : masteryAssessments.length === 0 ? (
                  <SelectItem value="none" disabled>No mastery assessments found</SelectItem>
                ) : (
                  masteryAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{assessment.title}</span>
                        <Badge variant="outline" className="ml-2">
                          {assessment.difficulty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Assessment Details */}
          {selectedAssessmentData && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedAssessmentData.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedAssessmentData.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{selectedAssessmentData.difficulty}</Badge>
                    <Badge variant="outline">{selectedAssessmentData.total_questions} questions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddQuestions}
              disabled={!selectedAssessment || addQuestionsMutation.isPending}
              className="flex items-center gap-2"
            >
              {addQuestionsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Add {selectedQuestions.size} Question(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToMasteryAssessmentDialog;
