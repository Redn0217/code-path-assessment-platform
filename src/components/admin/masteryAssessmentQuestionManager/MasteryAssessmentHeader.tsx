
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface MasteryAssessmentHeaderProps {
  assessment: any;
  parsedDomains: string[];
  onBack: () => void;
  actionButtons?: React.ReactNode;
  stats?: {
    total: number;
    mcq: number;
    coding: number;
    scenario: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

const MasteryAssessmentHeader: React.FC<MasteryAssessmentHeaderProps> = ({
  assessment,
  parsedDomains,
  onBack,
  actionButtons,
  stats
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Mastery Assessments
            </Button>
            <div>
              <CardTitle>Questions for {assessment?.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage questions for domains: {parsedDomains.join(', ')}
              </p>
            </div>
          </div>
          {actionButtons && (
            <div className="flex items-center gap-2">
              {actionButtons}
            </div>
          )}
        </div>

        {/* Statistics Badges */}
        {stats && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <Badge
                variant="secondary"
                className="text-sm hover:bg-gray-300 transition-colors cursor-default"
              >
                {stats.total} Questions
              </Badge>
            </div>

            <div className="h-4 w-px bg-gray-300 mx-1"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Types:</span>
              <Badge className="bg-blue-100 text-blue-800 text-sm hover:bg-blue-200 transition-colors cursor-default">
                {stats.mcq} MCQ
              </Badge>
              <Badge className="bg-green-100 text-green-800 text-sm hover:bg-green-200 transition-colors cursor-default">
                {stats.coding} Coding
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 text-sm hover:bg-purple-200 transition-colors cursor-default">
                {stats.scenario} Scenario
              </Badge>
            </div>

            <div className="h-4 w-px bg-gray-300 mx-1"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <Badge className="bg-emerald-100 text-emerald-800 text-sm hover:bg-emerald-200 transition-colors cursor-default">
                {stats.beginner} Beginner
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 text-sm hover:bg-yellow-200 transition-colors cursor-default">
                {stats.intermediate} Intermediate
              </Badge>
              <Badge className="bg-red-100 text-red-800 text-sm hover:bg-red-200 transition-colors cursor-default">
                {stats.advanced} Advanced
              </Badge>
            </div>
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default MasteryAssessmentHeader;
