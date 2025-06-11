
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { hasEnoughQuestions } from './AssessmentConfigUtils';

interface AssessmentConfigTableProps {
  configs?: any[];
  questionCounts?: any;
  isLoading: boolean;
  onEdit: (config: any) => void;
}

const AssessmentConfigTable: React.FC<AssessmentConfigTableProps> = ({
  configs,
  questionCounts,
  isLoading,
  onEdit,
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
          <TableHead>Domain</TableHead>
          <TableHead>MCQ</TableHead>
          <TableHead>Coding</TableHead>
          <TableHead>Scenario</TableHead>
          <TableHead>Time (min)</TableHead>
          <TableHead>Available Questions</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs?.map((config) => {
          const counts = questionCounts?.[config.domain] || { mcq: 0, coding: 0, scenario: 0, total: 0 };
          const hasSufficientQuestions = hasEnoughQuestions(config, counts);
          
          return (
            <TableRow key={config.id}>
              <TableCell>
                <Badge variant="outline">{config.domain}</Badge>
              </TableCell>
              <TableCell>{config.mcq_count} ({counts.mcq} available)</TableCell>
              <TableCell>{config.coding_count} ({counts.coding} available)</TableCell>
              <TableCell>{config.scenario_count} ({counts.scenario} available)</TableCell>
              <TableCell>{config.total_time_minutes}</TableCell>
              <TableCell>
                <Badge variant={hasSufficientQuestions ? "default" : "destructive"}>
                  {hasSufficientQuestions ? "Sufficient" : "Insufficient"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(config)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AssessmentConfigTable;
