
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DifficultyBadge, TypeBadge, DomainBadge } from './QuestionBadges';

interface Question {
  id: string;
  title: string;
  domain: string;
  question_type: string;
  difficulty: string;
  created_at: string;
}

interface QuestionTableProps {
  questions?: Question[];
  isLoading: boolean;
  onEdit: (question: Question) => void;
  onDelete: (questionOrId: Question | string) => void;
  deleteButtonText?: string;
  deleteButtonTooltip?: string;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  isLoading,
  onEdit,
  onDelete,
  deleteButtonText = "Delete",
  deleteButtonTooltip = "Delete this question",
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions?.map((question) => (
          <TableRow key={question.id}>
            <TableCell className="font-medium">{question.title}</TableCell>
            <TableCell>
              <DomainBadge domain={question.domain} />
            </TableCell>
            <TableCell>
              <TypeBadge type={question.question_type} />
            </TableCell>
            <TableCell>
              <DifficultyBadge difficulty={question.difficulty} />
            </TableCell>
            <TableCell>
              {new Date(question.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(question)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(question)}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  title={deleteButtonTooltip}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteButtonText !== "Delete" && (
                    <span className="ml-1 text-xs">{deleteButtonText}</span>
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default QuestionTable;
