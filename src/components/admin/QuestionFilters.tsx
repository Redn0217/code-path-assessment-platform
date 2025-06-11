
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DOMAINS = [
  'python', 'devops', 'cloud', 'linux', 'networking', 
  'storage', 'virtualization', 'object-storage', 'ai-ml'
];

interface QuestionFiltersProps {
  filterDomain: string;
  filterType: string;
  filterDifficulty: string;
  onDomainChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filterDomain,
  filterType,
  filterDifficulty,
  onDomainChange,
  onTypeChange,
  onDifficultyChange,
}) => {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <div className="min-w-[200px]">
        <Label>Domain</Label>
        <Select value={filterDomain} onValueChange={onDomainChange}>
          <SelectTrigger>
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {DOMAINS.map(domain => (
              <SelectItem key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="min-w-[150px]">
        <Label>Type</Label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="mcq">MCQ</SelectItem>
            <SelectItem value="coding">Coding</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="min-w-[150px]">
        <Label>Difficulty</Label>
        <Select value={filterDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
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
