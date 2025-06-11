
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuestionBadgesProps {
  difficulty?: string;
  type?: string;
}

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'mcq': return 'bg-blue-100 text-blue-800';
    case 'coding': return 'bg-purple-100 text-purple-800';
    case 'scenario': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => (
  <Badge className={getDifficultyColor(difficulty)}>
    {difficulty}
  </Badge>
);

export const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge className={getTypeColor(type)}>
    {type.toUpperCase()}
  </Badge>
);

export const DomainBadge: React.FC<{ domain: string }> = ({ domain }) => (
  <Badge variant="outline">{domain}</Badge>
);
