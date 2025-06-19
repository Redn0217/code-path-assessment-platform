import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Code, Users, Target, Play } from 'lucide-react';
import { GeneratedAssessment } from '@/services/assessmentGenerator';

interface AssessmentPreviewProps {
  assessmentData: GeneratedAssessment;
  moduleName: string;
  onStartAssessment: () => void;
  isLoading?: boolean;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  assessmentData,
  moduleName,
  onStartAssessment,
  isLoading = false
}) => {
  const { metadata, config } = assessmentData;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return <FileText className="h-4 w-4" />;
      case 'coding':
        return <Code className="h-4 w-4" />;
      case 'scenario':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'coding':
        return 'Coding Challenge';
      case 'scenario':
        return 'Scenario Based';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Assessment Preview</CardTitle>
              <p className="text-gray-600 mt-1">
                {moduleName} - Customized Assessment
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-2" />
              {config?.total_time_minutes || metadata.estimated_time_minutes} minutes
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{metadata.total_questions}</p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{config?.total_time_minutes || metadata.estimated_time_minutes}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((metadata.estimated_time_minutes / metadata.total_questions) * 10) / 10}
                </p>
                <p className="text-sm text-gray-600">Min/Question</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MCQ Questions */}
            {metadata.mcq_count > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getQuestionTypeIcon('mcq')}
                  <div>
                    <p className="font-medium">{getQuestionTypeLabel('mcq')}</p>
                    <p className="text-sm text-gray-600">{metadata.mcq_count} questions</p>
                  </div>
                </div>
                <Badge variant="secondary">{metadata.mcq_count}</Badge>
              </div>
            )}

            {/* Coding Questions */}
            {metadata.coding_count > 0 && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getQuestionTypeIcon('coding')}
                  <div>
                    <p className="font-medium">{getQuestionTypeLabel('coding')}</p>
                    <p className="text-sm text-gray-600">{metadata.coding_count} questions</p>
                  </div>
                </div>
                <Badge variant="secondary">{metadata.coding_count}</Badge>
              </div>
            )}

            {/* Scenario Questions */}
            {metadata.scenario_count > 0 && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getQuestionTypeIcon('scenario')}
                  <div>
                    <p className="font-medium">{getQuestionTypeLabel('scenario')}</p>
                    <p className="text-sm text-gray-600">{metadata.scenario_count} questions</p>
                  </div>
                </div>
                <Badge variant="secondary">{metadata.scenario_count}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Beginner */}
            {metadata.difficulty_breakdown.beginner > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getDifficultyColor('beginner')}>
                    Beginner
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metadata.difficulty_breakdown.beginner} questions
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {Math.round((metadata.difficulty_breakdown.beginner / metadata.total_questions) * 100)}%
                </div>
              </div>
            )}

            {/* Intermediate */}
            {metadata.difficulty_breakdown.intermediate > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getDifficultyColor('intermediate')}>
                    Intermediate
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metadata.difficulty_breakdown.intermediate} questions
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {Math.round((metadata.difficulty_breakdown.intermediate / metadata.total_questions) * 100)}%
                </div>
              </div>
            )}

            {/* Advanced */}
            {metadata.difficulty_breakdown.advanced > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getDifficultyColor('advanced')}>
                    Advanced
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {metadata.difficulty_breakdown.advanced} questions
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {Math.round((metadata.difficulty_breakdown.advanced / metadata.total_questions) * 100)}%
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">MCQ Target</p>
                <p className="text-gray-600">{config.mcq_count} questions</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Coding Target</p>
                <p className="text-gray-600">{config.coding_count} questions</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Scenario Target</p>
                <p className="text-gray-600">{config.scenario_count} questions</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Time Limit</p>
                <p className="text-gray-600">{config.total_time_minutes} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Assessment Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Ready to begin your assessment? Click the button below to start.
            </p>
            <Button 
              onClick={onStartAssessment}
              disabled={isLoading || metadata.total_questions === 0}
              size="lg"
              className="px-8"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Start Assessment'}
            </Button>
            {metadata.total_questions === 0 && (
              <p className="text-sm text-red-600">
                No questions available for this assessment configuration.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentPreview;
