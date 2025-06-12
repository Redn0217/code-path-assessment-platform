
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import QuestionFilters from './QuestionFilters';
import QuestionTable from './QuestionTable';
import MasteryAssessmentHeader from './masteryAssessmentQuestionManager/MasteryAssessmentHeader';
import QuestionActions from './masteryAssessmentQuestionManager/QuestionActions';
import { useMasteryQuestions } from './masteryAssessmentQuestionManager/useMasteryQuestions';
import { useDomainsParsing } from './masteryAssessmentQuestionManager/useDomainsParsing';

interface MasteryAssessmentQuestionManagerProps {
  assessment: any;
  onBack: () => void;
}

const MasteryAssessmentQuestionManager: React.FC<MasteryAssessmentQuestionManagerProps> = ({ 
  assessment, 
  onBack 
}) => {
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  console.log('MasteryAssessmentQuestionManager - assessment:', assessment);

  const parsedDomains = useDomainsParsing(assessment);
  console.log('Parsed domains:', parsedDomains);

  const { questions, isLoading, handleDelete, refetch } = useMasteryQuestions(
    assessment,
    parsedDomains,
    filterType,
    filterDifficulty,
    filterDomain
  );

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    refetch();
  };

  if (!assessment) {
    return (
      <div className="flex justify-center p-8">
        <p>No assessment selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <MasteryAssessmentHeader
          assessment={assessment}
          parsedDomains={parsedDomains}
          onBack={onBack}
        />
        <div className="px-6 pb-2">
          <QuestionActions
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            editingQuestion={editingQuestion}
            setEditingQuestion={setEditingQuestion}
            parsedDomains={parsedDomains}
            onFormClose={handleFormClose}
            masteryAssessmentId={assessment.id}
          />
        </div>
        <CardContent>
          <QuestionFilters
            filterType={filterType}
            filterDifficulty={filterDifficulty}
            filterDomain={filterDomain}
            onTypeChange={setFilterType}
            onDifficultyChange={setFilterDifficulty}
            onDomainChange={setFilterDomain}
            hideModuleFilter={true}
            availableDomains={parsedDomains}
          />

          <QuestionTable
            questions={questions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MasteryAssessmentQuestionManager;
