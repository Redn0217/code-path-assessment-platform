import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Code, Users, Target, Play, AlertTriangle, Shield, Timer } from 'lucide-react';

interface MasteryAssessmentPreviewProps {
  assessment: any;
  questions: any[];
  timeLeft: number;
  onStartAssessment: () => void;
  isLoading?: boolean;
}

const MasteryAssessmentPreview: React.FC<MasteryAssessmentPreviewProps> = ({
  assessment,
  questions,
  timeLeft,
  onStartAssessment,
  isLoading = false
}) => {
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

  // Analyze questions by type and difficulty
  const questionsByType = questions.reduce((acc: any, question: any) => {
    const type = question.question_type || 'mcq';
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {});

  const questionsByDifficulty = questions.reduce((acc: any, question: any) => {
    const difficulty = question.difficulty || 'intermediate';
    if (!acc[difficulty]) acc[difficulty] = 0;
    acc[difficulty]++;
    return acc;
  }, {});

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Mastery Assessment Preview
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {assessment.title} - Comprehensive Certification Assessment
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-2" />
              {Math.floor(timeLeft / 60)} minutes
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important Notice:</p>
              <ul className="space-y-1">
                <li>• This is a one-time assessment - you cannot retake it</li>
                <li>• Navigation will be restricted once you start</li>
                <li>• Assessment will auto-submit when time expires</li>
                <li>• You cannot go back to previous questions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.floor(timeLeft / 60)}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{assessment.difficulty}</p>
                <p className="text-sm text-gray-600">Difficulty</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Types Breakdown */}
      {Object.keys(questionsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(questionsByType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getQuestionTypeIcon(type)}
                  <div>
                    <p className="font-semibold">{count} Questions</p>
                    <p className="text-sm text-gray-600">{getQuestionTypeLabel(type)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Distribution */}
      {Object.keys(questionsByDifficulty).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(questionsByDifficulty).map(([difficulty, count]: [string, any]) => (
                <Badge 
                  key={difficulty} 
                  variant="secondary" 
                  className={`${getDifficultyColor(difficulty)} px-3 py-1`}
                >
                  {difficulty}: {count} questions
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Choose the best answer for each question</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>You have {Math.floor(timeLeft / 60)} minutes to complete the assessment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>You cannot go back to previous questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>This assessment can only be taken once</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Assessment will automatically submit when time expires</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Navigation will be restricted during the assessment</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Start Assessment Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Ready to begin your mastery assessment? Once you start, you cannot pause or restart.
            </p>
            <Button
              onClick={onStartAssessment}
              disabled={isLoading || questions.length === 0}
              size="lg"
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Start Mastery Assessment'}
            </Button>
            {questions.length === 0 && (
              <p className="text-sm text-red-600">
                No questions available for this mastery assessment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasteryAssessmentPreview;
