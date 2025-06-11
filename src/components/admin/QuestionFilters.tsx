
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QuestionFiltersProps {
  filterDomain?: string;
  filterType: string;
  filterDifficulty: string;
  onDomainChange?: (domain: string) => void;
  onTypeChange: (type: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  hideModuleFilter?: boolean;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filterDomain,
  filterType,
  filterDifficulty,
  onDomainChange,
  onTypeChange,
  onDifficultyChange,
  hideModuleFilter = false,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {!hideModuleFilter && onDomainChange && (
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Domain:</Label>
          <Select value={filterDomain} onValueChange={onDomainChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="linux">Linux</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="virtualization">Virtualization</SelectItem>
              <SelectItem value="object-storage">Object Storage</SelectItem>
              <SelectItem value="ai-ml">AI & ML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Type:</Label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mcq">Multiple Choice</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Difficulty:</Label>
        <Select value={filterDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuestionFilters;
