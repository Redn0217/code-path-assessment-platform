
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

  // Calculate statistics
  const stats = {
    total: questions?.length || 0,
    mcq: questions?.filter(q => q.question_type === 'mcq').length || 0,
    coding: questions?.filter(q => q.question_type === 'coding').length || 0,
    scenario: questions?.filter(q => q.question_type === 'scenario').length || 0,
    beginner: questions?.filter(q => q.difficulty === 'beginner').length || 0,
    intermediate: questions?.filter(q => q.difficulty === 'intermediate').length || 0,
    advanced: questions?.filter(q => q.difficulty === 'advanced').length || 0,
  };

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
          stats={stats}
          actionButtons={
            <QuestionActions
              isFormOpen={isFormOpen}
              setIsFormOpen={setIsFormOpen}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              parsedDomains={parsedDomains}
              onFormClose={handleFormClose}
              masteryAssessmentId={assessment.id}
              assessment={assessment}
            />
          }
        />
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
