
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { domains } from './moduleData';

interface DomainFilterProps {
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

const DomainFilter: React.FC<DomainFilterProps> = ({ selectedDomain, onDomainChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <Label>Filter by Domain:</Label>
      <Select value={selectedDomain} onValueChange={onDomainChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.id} value={domain.id}>
              {domain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DomainFilter;
