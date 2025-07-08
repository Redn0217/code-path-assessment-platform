import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportQuestionsFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ImportQuestionsForm: React.FC<ImportQuestionsFormProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'practice' | 'mastery'>('practice');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const importMutation = useMutation({
    mutationFn: async (data: { questions: any[], type: 'practice' | 'mastery' }) => {
      const { questions, type } = data;

      if (type === 'practice') {
        // Step 1: Import to question_bank table first
        const questionsToInsert = questions.map(q => {
          // Remove fields that don't belong in question_bank
          const { id, module, source, created_at, ...questionData } = q;
          return {
            ...questionData,
            domain: selectedDomain || q.domain,
          };
        });

        const { data: insertedQuestions, error: bankError } = await supabase
          .from('question_bank')
          .insert(questionsToInsert)
          .select('*');

        if (bankError) throw bankError;

        // Step 2: If module is selected, create assignments in questions table
        if (selectedModule && insertedQuestions) {
          const assignments = insertedQuestions.map(qb => ({
            module_id: selectedModule,
            question_bank_id: qb.id,
            title: qb.title,
            question_text: qb.question_text,
            question_type: qb.question_type as 'mcq' | 'coding' | 'scenario',
            difficulty: qb.difficulty as 'beginner' | 'intermediate' | 'advanced',
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

          const { error: assignmentError } = await supabase
            .from('questions')
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      } else {
        // Import to mastery_assessment_questions table
        const { error } = await supabase
          .from('mastery_assessment_questions')
          .insert(questions);

        if (error) throw error;
      }

      return questions.length;
    },
    onSuccess: (count) => {
      // Invalidate all relevant query keys
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      queryClient.invalidateQueries({ queryKey: ['question-bank-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['available-questions'] });
      queryClient.invalidateQueries({ queryKey: ['available-mastery-questions'] });
      queryClient.invalidateQueries({ queryKey: ['module-questions'] });
      toast({
        title: "Import Successful",
        description: `${count} question(s) imported successfully.`,
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import questions.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          
          if (Array.isArray(jsonData)) {
            setPreviewData(jsonData.slice(0, 5)); // Show first 5 for preview
            validateQuestions(jsonData);
          } else {
            setValidationErrors(['File must contain an array of questions']);
          }
        } catch (error) {
          setValidationErrors(['Invalid JSON file format']);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const validateQuestions = (questions: any[]) => {
    const errors: string[] = [];
    
    questions.forEach((question, index) => {
      if (!question.title) errors.push(`Question ${index + 1}: Missing title`);
      if (!question.question_text) errors.push(`Question ${index + 1}: Missing question text`);
      if (!question.question_type) errors.push(`Question ${index + 1}: Missing question type`);
      if (!question.difficulty) errors.push(`Question ${index + 1}: Missing difficulty`);
      if (!question.correct_answer) errors.push(`Question ${index + 1}: Missing correct answer`);
      
      if (question.question_type === 'mcq' && (!question.options || !Array.isArray(question.options))) {
        errors.push(`Question ${index + 1}: MCQ questions must have options array`);
      }
    });
    
    setValidationErrors(errors);
  };

  const handleImport = () => {
    if (!file || !previewData.length) {
      toast({
        title: "No File Selected",
        description: "Please select a valid JSON file to import.",
        variant: "destructive",
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix validation errors before importing.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const questions = JSON.parse(content);
        importMutation.mutate({ questions, type: importType });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse the file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Import Type Selection */}
      <div className="space-y-3">
        <Label>Import Type</Label>
        <Select value={importType} onValueChange={(value: 'practice' | 'mastery') => setImportType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="practice">Practice Hub Questions</SelectItem>
            <SelectItem value="mastery">Mastery Assessment Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domain/Module Selection for Practice Questions */}
      {importType === 'practice' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Domain Override (Optional)</Label>
            <Input
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              placeholder="e.g., python, devops"
            />
            <p className="text-xs text-gray-500 mt-1">Override domain for all imported questions</p>
          </div>
          <div>
            <Label>Assign to Module (Optional)</Label>
            <Input
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              placeholder="Module ID"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically assign all questions to this module</p>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="space-y-3">
        <Label>Select JSON File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <Input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="max-w-xs mx-auto"
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload a JSON file containing an array of questions. Questions will be imported to the Question Bank and optionally assigned to a module.
          </p>
          <details className="mt-3 text-left">
            <summary className="text-sm font-medium cursor-pointer text-blue-600">
              View JSON Format Example
            </summary>
            <div className="mt-2 space-y-2">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`[
  {
    "title": "Python Basics",
    "question_text": "What is the output of print('Hello World')?",
    "question_type": "mcq",
    "difficulty": "beginner",
    "domain": "python",
    "options": ["Hello World", "hello world", "Error", "None"],
    "correct_answer": "Hello World",
    "explanation": "Python print function outputs exactly what's in quotes",
    "tags": ["python", "basics", "print"],
    "time_limit": 300,
    "memory_limit": 128
  }
]`}
              </pre>
              <p className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                <strong>Note:</strong> Fields like 'id', 'module', 'source', and 'created_at' from exported files will be ignored during import.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.slice(0, 10).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
              {validationErrors.length > 10 && (
                <li className="font-semibold">... and {validationErrors.length - 10} more errors</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewData.length > 0 && validationErrors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Preview (First 5 Questions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {previewData.map((question, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{question.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {question.question_text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {question.question_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleImport}
          disabled={!file || validationErrors.length > 0 || importMutation.isPending}
          className="flex items-center gap-2"
        >
          {importMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Importing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Import Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImportQuestionsForm;
