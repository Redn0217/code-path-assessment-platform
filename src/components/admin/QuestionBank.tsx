import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Plus, Download, Upload, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddToMasteryAssessmentDialog from './AddToMasteryAssessmentDialog';
import QuestionViewDialog from './QuestionViewDialog';
import QuestionForm from './QuestionForm';
import ImportQuestionsForm from './ImportQuestionsForm';

type QuestionType = 'mcq' | 'coding' | 'scenario' | 'all';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
type QuestionSource = 'practice' | 'mastery' | 'all';

const QuestionBank = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<QuestionType>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [selectedSource, setSelectedSource] = useState<QuestionSource>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch domains
  const { data: domains = [] } = useQuery({
    queryKey: ['question-bank-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch modules based on selected domain
  const { data: modules = [] } = useQuery({
    queryKey: ['question-bank-modules', selectedDomain],
    queryFn: async () => {
      if (selectedDomain === 'all') return [];
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('domain_id', selectedDomain)
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedDomain !== 'all',
  });

  // Fetch practice questions from question bank
  const { data: practiceQuestions = [], isLoading: loadingPractice } = useQuery({
    queryKey: ['question-bank', selectedSource, selectedDomain, selectedModule, selectedType, selectedDifficulty, searchTerm],
    queryFn: async () => {
      if (selectedSource === 'mastery') return [];

      try {
        // First, get all questions from question bank
        let bankQuery = supabase
          .from('question_bank')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        // Apply basic filters
        if (selectedType !== 'all') {
          bankQuery = bankQuery.eq('question_type', selectedType);
        }
        if (selectedDifficulty !== 'all') {
          bankQuery = bankQuery.eq('difficulty', selectedDifficulty);
        }
        if (searchTerm) {
          bankQuery = bankQuery.or(`title.ilike.%${searchTerm}%,question_text.ilike.%${searchTerm}%`);
        }

        const { data: bankData, error: bankError } = await bankQuery;
        if (bankError) throw bankError;

        // Get assignment information separately
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('questions')
          .select('question_bank_id, module_id, created_at');

        if (assignmentError) throw assignmentError;

        // Transform and combine the data
        const transformedData = (bankData || []).map(q => {
          // Find assignments for this question
          const assignments = (assignmentData || []).filter(a => a.question_bank_id === q.id);

          return {
            ...q,
            source: 'practice' as const,
            domain_name: q.domain,
            module_name: assignments.length > 0 ? `Assigned to ${assignments.length} module(s)` : 'Unassigned',
            assignments: assignments,
            is_assigned: assignments.length > 0,
            assignment_count: assignments.length
          };
        });

        return transformedData;
      } catch (error) {
        console.error('Error fetching question bank data:', error);
        throw error;
      }
    },
  });

  // Fetch mastery assessment questions
  const { data: masteryQuestions = [], isLoading: loadingMastery } = useQuery({
    queryKey: ['question-bank-mastery', selectedSource, selectedDomain, selectedModule, selectedType, selectedDifficulty, searchTerm],
    queryFn: async () => {
      if (selectedSource === 'practice') return [];
      
      let query = supabase
        .from('mastery_assessment_questions')
        .select(`
          *,
          mastery_assessments!inner(
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedType !== 'all') {
        query = query.eq('question_type', selectedType);
      }
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty);
      }
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,question_text.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(q => ({
        ...q,
        source: 'mastery' as const,
        domain_name: q.domain || 'Unknown',
        module_name: q.mastery_assessments?.title || 'Mastery Assessment'
      }));
    },
  });

  // Combine questions
  const allQuestions = [...practiceQuestions, ...masteryQuestions];
  const isLoading = loadingPractice || loadingMastery;

  // Pagination
  const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = allQuestions.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: allQuestions.length,
    practice: practiceQuestions.length,
    mastery: masteryQuestions.length,
    mcq: allQuestions.filter(q => q.question_type === 'mcq').length,
    coding: allQuestions.filter(q => q.question_type === 'coding').length,
    scenario: allQuestions.filter(q => q.question_type === 'scenario').length,
    beginner: allQuestions.filter(q => q.difficulty === 'beginner').length,
    intermediate: allQuestions.filter(q => q.difficulty === 'intermediate').length,
    advanced: allQuestions.filter(q => q.difficulty === 'advanced').length,
  };

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
      setSelectedQuestions(new Set(allQuestions.map(q => q.id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (question: any) => {
      if (question.source === 'practice') {
        // Delete from question bank (this will cascade to assignments)
        const { error } = await supabase
          .from('question_bank')
          .delete()
          .eq('id', question.id);
        if (error) throw error;
      } else {
        // Delete mastery assessment question
        const { error } = await supabase
          .from('mastery_assessment_questions')
          .delete()
          .eq('id', question.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      toast({
        title: "Question Deleted",
        description: "Question has been permanently deleted from the question bank.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Question",
        description: error.message || "Failed to delete question.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (questionIds: string[]) => {
      const questionsToDelete = allQuestions.filter(q => questionIds.includes(q.id));

      // Group by source
      const practiceQuestions = questionsToDelete.filter(q => q.source === 'practice');
      const masteryQuestions = questionsToDelete.filter(q => q.source === 'mastery');

      // Delete practice questions from question bank
      if (practiceQuestions.length > 0) {
        const { error } = await supabase
          .from('question_bank')
          .delete()
          .in('id', practiceQuestions.map(q => q.id));
        if (error) throw error;
      }

      // Delete mastery questions
      if (masteryQuestions.length > 0) {
        const { error } = await supabase
          .from('mastery_assessment_questions')
          .delete()
          .in('id', masteryQuestions.map(q => q.id));
        if (error) throw error;
      }

      return questionsToDelete.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank-mastery'] });
      setSelectedQuestions(new Set());
      toast({
        title: "Questions Deleted",
        description: `${count} question(s) have been successfully deleted.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Questions",
        description: error.message || "Failed to delete questions.",
        variant: "destructive",
      });
    },
  });

  // Export functionality
  const exportQuestions = (questions: any[]) => {
    const dataToExport = questions.map(q => ({
      id: q.id,
      title: q.title,
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      domain: q.domain_name || q.domain,
      module: q.module_name,
      source: q.source,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      code_template: q.code_template,
      test_cases: q.test_cases,
      time_limit: q.time_limit,
      memory_limit: q.memory_limit,
      tags: q.tags,
      created_at: q.created_at,
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${questions.length} question(s) exported successfully.`,
    });
  };

  const handleDeleteQuestion = (question: any) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      deleteQuestionMutation.mutate(question);
    }
  };

  const handleBulkDelete = () => {
    const count = selectedQuestions.size;
    if (window.confirm(`Are you sure you want to delete ${count} selected question(s)? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedQuestions));
    }
  };

  const handleEditQuestion = (question: any) => {
    console.log('QuestionBank handleEditQuestion - question:', question);
    // Force close and reopen to ensure fresh mount
    setIsFormOpen(false);
    setEditingQuestion(null);
    setTimeout(() => {
      setEditingQuestion(question);
      setIsFormOpen(true);
    }, 10);
  };

  const handleAddNewQuestion = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    queryClient.invalidateQueries({ queryKey: ['question-bank'] });
    queryClient.invalidateQueries({ queryKey: ['question-bank-mastery'] });
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'practice': return 'bg-indigo-100 text-indigo-800';
      case 'mastery': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Question Bank</CardTitle>
              <p className="text-gray-600 mt-1">
                Manage all questions across domains, modules, and mastery assessments
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {stats.total} Total Questions
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.practice} Practice
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.mastery} Mastery
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 text-sm">
                {stats.mcq} MCQ
              </Badge>
              <Badge className="bg-green-100 text-green-800 text-sm">
                {stats.coding} Coding
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 text-sm">
                {stats.scenario} Scenario
              </Badge>
              {selectedQuestions.size > 0 && (
                <Badge variant="default" className="text-sm">
                  {selectedQuestions.size} Selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select value={selectedSource} onValueChange={(value: QuestionSource) => setSelectedSource(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="practice">Practice Hub</SelectItem>
                      <SelectItem value="mastery">Mastery Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Domain</label>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Module</label>
                  <Select 
                    value={selectedModule} 
                    onValueChange={setSelectedModule}
                    disabled={selectedDomain === 'all' || selectedSource === 'mastery'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={selectedType} onValueChange={(value: QuestionType) => setSelectedType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={(value: DifficultyLevel) => setSelectedDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedQuestions.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedQuestions.size} question(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestions(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => exportQuestions(allQuestions.filter(q => selectedQuestions.has(q.id)))}
                >
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <AddToMasteryAssessmentDialog
                  selectedQuestions={selectedQuestions}
                  questions={allQuestions}
                  onSuccess={() => setSelectedQuestions(new Set())}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete Selected'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedQuestions.size === allQuestions.length && allQuestions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Questions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Questions</DialogTitle>
                  </DialogHeader>
                  <ImportQuestionsForm onClose={() => setIsImportOpen(false)} onSuccess={handleFormClose} />
                </DialogContent>
              </Dialog>

              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2" onClick={handleAddNewQuestion}>
                    <Plus className="h-4 w-4" />
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
                    key={editingQuestion ? `edit-${editingQuestion.source}-${editingQuestion.id}` : 'new-question'}
                    question={editingQuestion}
                    selectedModule={editingQuestion?.source === 'practice' ? {
                      id: editingQuestion?.module_id,
                      name: 'Module',
                      domain: editingQuestion?.domain
                    } : null}
                    onClose={handleFormClose}
                    assessmentDomains={editingQuestion?.source === 'mastery' ? [editingQuestion?.domain] : domains.map(d => d.name)}
                    masteryAssessmentId={editingQuestion?.source === 'mastery' ? editingQuestion?.mastery_assessment_id : undefined}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : allQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((question) => (
                <div
                  key={`${question.source}-${question.id}`}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-3">
                      {/* Question Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{question.title}</h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">{question.question_text}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <QuestionViewDialog question={question} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteQuestion(question)}
                            disabled={deleteQuestionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Question Metadata */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getSourceColor(question.source)}>
                          {question.source === 'practice' ? 'Practice Hub' : 'Mastery Assessment'}
                        </Badge>
                        <Badge className={getQuestionTypeColor(question.question_type)}>
                          {question.question_type.toUpperCase()}
                        </Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.domain_name}
                        </Badge>
                        <Badge variant="outline">
                          {question.module_name}
                        </Badge>
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {question.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{question.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Question Details */}
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span>Created: {new Date(question.created_at).toLocaleDateString()}</span>
                        {question.time_limit && (
                          <span>Time Limit: {Math.floor(question.time_limit / 60)}m</span>
                        )}
                        {question.question_type === 'mcq' && question.options && (
                          <span>Options: {Array.isArray(question.options) ? question.options.length : 'N/A'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, allQuestions.length)} of {allQuestions.length} questions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionBank;
