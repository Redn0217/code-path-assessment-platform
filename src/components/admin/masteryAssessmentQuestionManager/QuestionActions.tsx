
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import QuestionForm from '../QuestionForm';

interface QuestionActionsProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingQuestion: any;
  setEditingQuestion: (question: any) => void;
  parsedDomains: string[];
  onFormClose: () => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingQuestion,
  setEditingQuestion,
  parsedDomains,
  onFormClose
}) => {
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>
        <QuestionForm 
          question={editingQuestion} 
          selectedModule={null}
          onClose={onFormClose}
          assessmentDomains={parsedDomains}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionActions;
