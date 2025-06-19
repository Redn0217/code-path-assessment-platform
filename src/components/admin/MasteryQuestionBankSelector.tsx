import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MasteryQuestionBankSelectorProps {
  assessment: any;
  parsedDomains: string[];
  onClose: () => void;
}

const MasteryQuestionBankSelector: React.FC<MasteryQuestionBankSelectorProps> = ({ 
  assessment, 
  parsedDomains, 
  onClose 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Fetch available questions from question bank (excluding already assigned ones)
  const { data: availableQuestions = [], isLoading } = useQuery({
    queryKey: ['available-mastery-questions', assessment?.id, searchTerm, selectedType, selectedDifficulty, selectedDomain],
    queryFn: async () => {
      try {
        // Get all questions from question bank
        let bankQuery = supabase
          .from('question_bank')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // Apply filters
        if (selectedType !== 'all') {
          bankQuery = bankQuery.eq('question_type', selectedType);
        }
        if (selectedDifficulty !== 'all') {
          bankQuery = bankQuery.eq('difficulty', selectedDifficulty);
        }
        if (selectedDomain !== 'all') {
          bankQuery = bankQuery.eq('domain', selectedDomain);
        }
        if (searchTerm) {
          bankQuery = bankQuery.or(`title.ilike.%${searchTerm}%,question_text.ilike.%${searchTerm}%`);
        }

        const { data: bankData, error: bankError } = await bankQuery;
        if (bankError) throw bankError;

        // Get already assigned questions for this mastery assessment
        const { data: assignedData, error: assignedError } = await supabase
          .from('mastery_assessment_questions')
          .select('title, question_text') // Use title and question_text to match
          .eq('mastery_assessment_id', assessment.id);
        
        if (assignedError) throw assignedError;

        // Create a set of assigned question signatures (title + question_text)
        const assignedSignatures = new Set(
          assignedData?.map(a => `${a.title}|||${a.question_text}`) || []
        );

        // Filter out already assigned questions by comparing title and question_text
        return (bankData || []).filter(q => 
          !assignedSignatures.has(`${q.title}|||${q.question_text}`)
        );
      } catch (error) {
        console.error('Error fetching available questions:', error);
        throw error;
      }
    },
    enabled: !!assessment?.id,
  });

  // Assign questions to mastery assessment mutation
  const assignQuestions = useMutation({
    mutationFn: async (questionIds: string[]) => {
      // Get the question bank data for the selected questions
      const { data: questionBankData, error: questionBankError } = await supabase
        .from('question_bank')
        .select('*')
        .in('id', questionIds);

      if (questionBankError) throw questionBankError;

      // Create assignments for mastery assessment questions table
      const assignments = questionBankData.map(qb => ({
        mastery_assessment_id: assessment.id,
        // Copy all required fields from question bank
        title: qb.title,
        question_text: qb.question_text,
        question_type: qb.question_type,
        difficulty: qb.difficulty,
        domain: qb.domain,
        options: qb.options,
        correct_answer: qb.correct_answer,
        explanation: qb.explanation,
        code_template: qb.code_template,
        test_cases: qb.test_cases,
        time_limit: qb.time_limit,
        memory_limit: qb.memory_limit,
        tags: qb.tags
      }));

      const { error } = await supabase
        .from('mastery_assessment_questions')
        .insert(assignments);

      if (error) {
        // Handle potential duplicate assignments gracefully
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Some questions are already assigned to this assessment. Please refresh and try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mastery-assessment-questions'] });
      queryClient.invalidateQueries({ queryKey: ['available-mastery-questions'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({ 
        title: 'Questions Assigned', 
        description: `${selectedQuestions.size} question(s) assigned to ${assessment.title}` 
      });
      setSelectedQuestions(new Set());
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error Assigning Questions', 
        description: error.message || 'Failed to assign questions',
        variant: 'destructive' 
      });
    },
  });

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuestions);
    if (checked) {
      newSelected.add(questionId);
    } else {
      newSelected.delete(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(new Set(availableQuestions.map(q => q.id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleAssignSelected = () => {
    if (selectedQuestions.size === 0) {
      toast({ 
        title: 'No Questions Selected', 
        description: 'Please select at least one question to assign',
        variant: 'destructive' 
      });
      return;
    }

    assignQuestions.mutate(Array.from(selectedQuestions));
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-800';
      case 'coding': return 'bg-green-100 text-green-800';
      case 'scenario': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Add Questions from Question Bank</h3>
          <p className="text-sm text-gray-600">
            Select questions to assign to {assessment?.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Domains: {parsedDomains.join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedQuestions.size} selected
          </Badge>
          <Button 
            onClick={handleAssignSelected}
            disabled={selectedQuestions.size === 0 || assignQuestions.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Selected ({selectedQuestions.size})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {parsedDomains.map(domain => (
              <SelectItem key={domain} value={domain}>{domain}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedQuestions.size === availableQuestions.length && availableQuestions.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm font-medium">Select All ({availableQuestions.length} available)</span>
      </div>

      {/* Questions List */}
      <div className="max-h-96 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : availableQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No available questions found. All questions may already be assigned to this assessment.</p>
          </div>
        ) : (
          availableQuestions.map((question) => (
            <Card key={question.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{question.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getQuestionTypeColor(question.question_type)}>
                          {question.question_type.toUpperCase()}
                        </Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Domain: {question.domain}</span>
                      {question.tags && question.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Tags: {question.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MasteryQuestionBankSelector;
