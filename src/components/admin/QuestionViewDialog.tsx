import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Code, FileText, Users, Clock, HardDrive } from 'lucide-react';

interface QuestionViewDialogProps {
  question: any;
  trigger?: React.ReactNode;
}

const QuestionViewDialog: React.FC<QuestionViewDialogProps> = ({ question, trigger }) => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <FileText className="h-4 w-4" />;
      case 'coding': return <Code className="h-4 w-4" />;
      case 'scenario': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
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

  const renderOptions = (options: any) => {
    if (!options) return null;
    
    let optionsList: string[] = [];
    if (Array.isArray(options)) {
      optionsList = options;
    } else if (typeof options === 'string') {
      try {
        optionsList = JSON.parse(options);
      } catch {
        return <p className="text-gray-500">Invalid options format</p>;
      }
    }

    return (
      <div className="space-y-2">
        {optionsList.map((option, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg border ${
              option === question.correct_answer 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {String.fromCharCode(65 + index)}.
              </span>
              <span>{option}</span>
              {option === question.correct_answer && (
                <Badge className="bg-green-100 text-green-800 text-xs">Correct</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getQuestionTypeIcon(question.question_type)}
            Question Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getQuestionTypeColor(question.question_type)}>
                      {question.question_type.toUpperCase()}
                    </Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {question.domain_name || question.domain}
                    </Badge>
                    <Badge variant="outline">
                      {question.module_name || 'Mastery Assessment'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Question Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{question.question_text}</p>
              </div>
            </CardContent>
          </Card>

          {/* Options (for MCQ) */}
          {question.question_type === 'mcq' && question.options && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Answer Options</CardTitle>
              </CardHeader>
              <CardContent>
                {renderOptions(question.options)}
              </CardContent>
            </Card>
          )}

          {/* Code Template (for Coding questions) */}
          {question.question_type === 'coding' && question.code_template && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{question.code_template}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Test Cases (for Coding questions) */}
          {question.question_type === 'coding' && question.test_cases && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(question.test_cases, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Correct Answer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Correct Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-mono text-green-800">{question.correct_answer}</p>
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          {question.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {question.time_limit && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Time Limit</p>
                      <p className="text-sm text-gray-600">{Math.floor(question.time_limit / 60)}m</p>
                    </div>
                  </div>
                )}
                {question.memory_limit && (
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Memory Limit</p>
                      <p className="text-sm text-gray-600">{question.memory_limit}MB</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(question.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-sm text-gray-600">
                    {question.source === 'practice' ? 'Practice Hub' : 'Mastery Assessment'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionViewDialog;
