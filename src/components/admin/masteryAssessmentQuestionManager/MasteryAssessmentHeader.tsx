
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface MasteryAssessmentHeaderProps {
  assessment: any;
  parsedDomains: string[];
  onBack: () => void;
  actionButtons?: React.ReactNode;
}

const MasteryAssessmentHeader: React.FC<MasteryAssessmentHeaderProps> = ({
  assessment,
  parsedDomains,
  onBack,
  actionButtons
}) => {
  return (
    <CardHeader>
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
    </CardHeader>
  );
};

export default MasteryAssessmentHeader;
