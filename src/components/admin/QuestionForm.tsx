import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/CodeEditor';

interface QuestionFormProps {
  question?: any;
  selectedModule: any;
  onClose: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, selectedModule, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    domain: selectedModule?.domain || '',
    module_id: selectedModule?.id || '',
    question_type: 'mcq',
    difficulty: 'beginner',
    title: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    code_template: '',
    test_cases: [{ input: '', expected_output: '', description: '' }],
    time_limit: 300,
    memory_limit: 128,
    tags: [],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        domain: question.domain || selectedModule?.domain || '',
        module_id: question.module_id || selectedModule?.id || '',
        question_type: question.question_type || 'mcq',
        difficulty: question.difficulty || 'beginner',
        title: question.title || '',
        question_text: question.question_text || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || '',
        explanation: question.explanation || '',
        code_template: question.code_template || '',
        test_cases: question.test_cases || [{ input: '', expected_output: '', description: '' }],
        time_limit: question.time_limit || 300,
        memory_limit: question.memory_limit || 128,
        tags: question.tags || [],
      });
    } else {
      // For new questions, set the module info
      setFormData(prev => ({
        ...prev,
        domain: selectedModule?.domain || '',
        module_id: selectedModule?.id || '',
      }));
    }
  }, [question, selectedModule]);

  const saveQuestion = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        options: data.question_type === 'mcq' ? data.options.filter(opt => opt.trim()) : null,
        test_cases: data.question_type === 'coding' ? data.test_cases.filter(tc => tc.input || tc.expected_output) : null,
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
      toast({ title: `Question ${question ? 'updated' : 'created'} successfully` });
      onClose();
    },
    onError: (error) => {
      toast({ 
        title: `Error ${question ? 'updating' : 'creating'} question`, 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.question_text || !formData.correct_answer) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.question_type === 'mcq' && formData.options.filter(opt => opt.trim()).length < 2) {
      toast({
        title: 'MCQ questions need at least 2 options',
        variant: 'destructive',
      });
      return;
    }

    saveQuestion.mutate(formData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateTestCase = (index: number, field: string, value: string) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({ 
      ...formData, 
      test_cases: [...formData.test_cases, { input: '', expected_output: '', description: '' }] 
    });
  };

  const removeTestCase = (index: number) => {
    const newTestCases = formData.test_cases.filter((_, i) => i !== index);
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Module Information */}
      <Card className="bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Module: {selectedModule?.name}</Badge>
            <Badge variant="outline">Domain: {selectedModule?.domain}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="question_type">Question Type *</Label>
          <Select value={formData.question_type} onValueChange={(value) => setFormData({ ...formData, question_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="coding">Coding Challenge</SelectItem>
              <SelectItem value="scenario">Scenario Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Question title"
        />
      </div>

      <div>
        <Label htmlFor="question_text">Question Text *</Label>
        <Textarea
          id="question_text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          placeholder="Enter the question text"
          rows={4}
        />
      </div>

      {/* MCQ Options */}
      {formData.question_type === 'mcq' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Answer Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Coding Template and Test Cases */}
      {formData.question_type === 'coding' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Template</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeEditor
                language={formData.domain === 'python' ? 'python' : formData.domain === 'linux' ? 'bash' : 'javascript'}
                value={formData.code_template}
                onChange={(code) => setFormData({ ...formData, code_template: code })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.test_cases.map((testCase, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    {formData.test_cases.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTestCase(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Input</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        placeholder="Test input"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Expected Output</Label>
                      <Textarea
                        value={testCase.expected_output}
                        onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                        placeholder="Expected output"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={testCase.description}
                      onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                      placeholder="Test case description"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTestCase}>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <Label htmlFor="correct_answer">Correct Answer *</Label>
        <Textarea
          id="correct_answer"
          value={formData.correct_answer}
          onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
          placeholder="Enter the correct answer"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why this is the correct answer"
          rows={3}
        />
      </div>

      {/* Time and Memory Limits for Coding Questions */}
      {formData.question_type === 'coding' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="time_limit">Time Limit (seconds)</Label>
            <Input
              id="time_limit"
              type="number"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 300 })}
            />
          </div>
          <div>
            <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
            <Input
              id="memory_limit"
              type="number"
              value={formData.memory_limit}
              onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) || 128 })}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

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
